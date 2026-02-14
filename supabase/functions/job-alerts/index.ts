import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all active profiles with webhook URLs
    const { data: profiles, error: fetchError } = await supabase
      .from("job_alert_profiles")
      .select("*")
      .eq("is_active", true)
      .not("zapier_webhook_url", "is", null);

    if (fetchError) throw fetchError;
    if (!profiles || profiles.length === 0) {
      console.log("No active profiles with webhooks found");
      return new Response(JSON.stringify({ message: "No active profiles" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ${profiles.length} profiles`);

    for (const profile of profiles) {
      try {
        const positions = profile.positions || [];
        const skills = profile.skills || [];

        if (positions.length === 0) continue;

        // Search jobs via Firecrawl
        const searchQueries = positions.slice(0, 3).map((p: string) => `${p} jobs hiring now`);
        const searchResults = await Promise.all(
          searchQueries.map(async (query: string) => {
            try {
              const response = await fetch("https://api.firecrawl.dev/v1/search", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ query, limit: 3, tbs: "qdr:h" }), // Last hour
              });
              if (!response.ok) return [];
              const data = await response.json();
              return data.data || [];
            } catch {
              return [];
            }
          })
        );

        const allResults = searchResults.flat();
        if (allResults.length === 0) continue;

        // Use AI to extract jobs
        const resultsText = allResults
          .map((r: any, i: number) =>
            `[${i + 1}] Title: ${r.title || "N/A"}\nURL: ${r.url || "N/A"}\nDescription: ${(r.description || r.markdown || "").substring(0, 400)}`
          )
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
                content: `Extract real job postings. User skills: ${skills.join(", ")}. Calculate matchScore (50-98) using: skills overlap 60%, role similarity 30%, location 10%. Only include jobs with matchScore >= 75. Return via tool.`,
              },
              { role: "user", content: `Extract jobs:\n\n${resultsText}` },
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
                            matchScore: { type: "number" },
                            url: { type: "string" },
                            matchedSkills: { type: "array", items: { type: "string" } },
                          },
                          required: ["title", "company", "location", "matchScore", "url", "matchedSkills"],
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
          console.error(`AI error for profile ${profile.id}:`, aiResponse.status);
          continue;
        }

        const aiResult = await aiResponse.json();
        const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall) continue;

        const parsed = JSON.parse(toolCall.function.arguments);
        const jobs = parsed.jobs || [];

        if (jobs.length === 0) continue;

        // Send to Zapier webhook for WhatsApp
        const message = `🔔 *Jobitter Alert*\n\n${jobs
          .slice(0, 5)
          .map(
            (j: any, i: number) =>
              `${i + 1}. *${j.title}* at ${j.company}\n   📍 ${j.location} | Match: ${j.matchScore}%\n   Skills: ${j.matchedSkills.join(", ")}\n   🔗 ${j.url}`
          )
          .join("\n\n")}\n\n_Found ${jobs.length} matching jobs for you!_`;

        await fetch(profile.zapier_webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            jobs,
            profile_id: profile.id,
            timestamp: new Date().toISOString(),
          }),
        });

        // Update last alerted timestamp
        await supabase
          .from("job_alert_profiles")
          .update({ last_alerted_at: new Date().toISOString() })
          .eq("id", profile.id);

        console.log(`Sent ${jobs.length} jobs to profile ${profile.id}`);
      } catch (profileErr) {
        console.error(`Error processing profile ${profile.id}:`, profileErr);
      }
    }

    return new Response(JSON.stringify({ success: true, profilesProcessed: profiles.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("job-alerts error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
