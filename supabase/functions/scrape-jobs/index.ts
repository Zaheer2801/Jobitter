import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { positions, skills, country } = await req.json();

    if (!positions || !Array.isArray(positions) || positions.length === 0) {
      return new Response(
        JSON.stringify({ error: "Positions array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Firecrawl connector not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Search for jobs using top 3 positions
    const countryFilter = country ? ` in ${country}` : "";
    const searchQueries = positions.slice(0, 3).map((p: string) => `${p} jobs hiring now${countryFilter}`);
    
    const searchResults = await Promise.all(
      searchQueries.map(async (query: string) => {
        try {
          const response = await fetch("https://api.firecrawl.dev/v1/search", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query,
              limit: 5,
              tbs: "qdr:w", // Last week
            }),
          });

          if (!response.ok) {
            console.error(`Firecrawl search failed for "${query}":`, response.status);
            return [];
          }

          const data = await response.json();
          return data.data || [];
        } catch (e) {
          console.error(`Search error for "${query}":`, e);
          return [];
        }
      })
    );

    // Flatten all search results
    const allResults = searchResults.flat();
    console.log(`Got ${allResults.length} raw search results`);

    if (allResults.length === 0) {
      return new Response(
        JSON.stringify({ jobs: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to extract structured job data from search results
    const resultsText = allResults
      .map((r: any, i: number) => `[${i + 1}] Title: ${r.title || "N/A"}\nURL: ${r.url || "N/A"}\nDescription: ${(r.description || r.markdown || "").substring(0, 500)}`)
      .join("\n\n");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a job listing parser. Extract real job listings from search results. For each ACTUAL job posting found, extract: title, company, location, workMode (Remote/Hybrid/On-site), salaryRange (if mentioned, else "Not disclosed"), url (the actual job posting URL), and postedAgo (if mentioned, else "Recent"). Only include real job postings, not articles or blog posts.${country ? ` IMPORTANT: Only include jobs located in ${country}. Exclude any jobs from other countries.` : ""} User's skills: ${(skills || []).join(", ")}. For each job, calculate a matchScore (50-98) based on how well the user's skills match the job requirements.`,
          },
          {
            role: "user",
            content: `Extract job listings from these search results:\n\n${resultsText}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_jobs",
              description: "Return extracted job listings",
              parameters: {
                type: "object",
                properties: {
                  jobs: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        company: { type: "string" },
                        location: { type: "string" },
                        workMode: { type: "string" },
                        salaryRange: { type: "string" },
                        matchScore: { type: "number" },
                        matchedSkills: { type: "array", items: { type: "string" } },
                        url: { type: "string" },
                        postedAgo: { type: "string" },
                      },
                      required: ["title", "company", "location", "workMode", "salaryRange", "matchScore", "matchedSkills", "url", "postedAgo"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["jobs"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_jobs" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", aiResponse.status);
      return new Response(JSON.stringify({ error: "Failed to process job results" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ jobs: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ jobs: parsed.jobs || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scrape-jobs error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
