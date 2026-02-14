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
    const { action, resumeText, profileData, currentRole } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "parse") {
      systemPrompt = `You are an expert resume parser. Extract structured information from the resume text provided. Return a JSON object using the tool provided with these fields:
- name: full name
- email: email address (if found)
- phone: phone number (if found)
- currentRole: current or most recent job title
- experience: brief summary of total experience (e.g. "5 years in software engineering")
- education: highest education (e.g. "BS Computer Science, MIT")
- skills: array of technical and soft skills found
- summary: a 2-3 sentence professional summary

Be thorough in extracting skills - include programming languages, tools, frameworks, methodologies, and soft skills.`;
      userPrompt = `Parse this resume:\n\n${resumeText}`;
    } else if (action === "enhance") {
      systemPrompt = `You are a career coach and resume optimization expert. Given the user's profile data, enhance each field for better market positioning. Make the summary more compelling, suggest additional relevant skills, and improve the experience description. Keep changes realistic and professional. Return the enhanced data using the tool provided.`;
      userPrompt = `Enhance this profile for better job market positioning. Current role context: ${currentRole || "not specified"}\n\nProfile:\n${JSON.stringify(profileData, null, 2)}`;
    } else if (action === "career-paths") {
      systemPrompt = `You are a career advisor. Given the user's skills, experience, and current role, suggest 5 realistic career paths they could pursue. For each path, provide a match percentage (50-98) based on how well their current skills align. Return results using the tool provided. Be realistic with match percentages.`;
      userPrompt = `Based on this profile, suggest career paths:\nCurrent Role: ${currentRole}\nSkills: ${profileData?.skills?.join(", ")}\nExperience: ${profileData?.experience}\nEducation: ${profileData?.education}`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tools = [];
    let tool_choice: any = undefined;

    if (action === "parse" || action === "enhance") {
      tools.push({
        type: "function",
        function: {
          name: "return_profile",
          description: "Return the parsed/enhanced profile data",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              currentRole: { type: "string" },
              experience: { type: "string" },
              education: { type: "string" },
              skills: { type: "array", items: { type: "string" } },
              summary: { type: "string" },
            },
            required: ["name", "skills", "experience", "education", "summary"],
            additionalProperties: false,
          },
        },
      });
      tool_choice = { type: "function", function: { name: "return_profile" } };
    } else if (action === "career-paths") {
      tools.push({
        type: "function",
        function: {
          name: "return_career_paths",
          description: "Return suggested career paths",
          parameters: {
            type: "object",
            properties: {
              paths: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    role: { type: "string" },
                    match: { type: "number" },
                    reason: { type: "string" },
                  },
                  required: ["role", "match", "reason"],
                  additionalProperties: false,
                },
              },
            },
            required: ["paths"],
            additionalProperties: false,
          },
        },
      });
      tool_choice = { type: "function", function: { name: "return_career_paths" } };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI did not return structured data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsedData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ data: parsedData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-resume error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
