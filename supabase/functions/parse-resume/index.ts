import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import mammoth from "npm:mammoth@1.8.0";
import pdfParse from "npm:pdf-parse@1.1.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function extractText(base64: string, fileName: string): Promise<string> {
  const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".docx") || lowerName.endsWith(".doc")) {
    try {
      const result = await mammoth.extractRawText({ buffer: buffer.buffer });
      console.log("Mammoth extracted text length:", result.value.length);
      return result.value;
    } catch (e) {
      console.error("Mammoth error:", e);
      throw new Error("Failed to parse DOCX file");
    }
  }

  if (lowerName.endsWith(".pdf")) {
    try {
      const result = await pdfParse(Buffer.from(buffer));
      console.log("PDF extracted text length:", result.text.length);
      return result.text;
    } catch (e) {
      console.error("PDF parse error:", e);
      throw new Error("Failed to parse PDF file");
    }
  }

  if (lowerName.endsWith(".txt")) {
    return new TextDecoder().decode(buffer);
  }

  throw new Error("Unsupported file format. Please upload PDF, DOCX, or TXT.");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, fileBase64, fileName, profileData, currentRole } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "parse") {
      if (!fileBase64 || !fileName) {
        return new Response(JSON.stringify({ error: "Missing file data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let resumeText: string;
      try {
        resumeText = await extractText(fileBase64, fileName);
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Extracted resume text (first 1000):", resumeText.substring(0, 1000));

      if (resumeText.trim().length < 20) {
        return new Response(
          JSON.stringify({ error: "Could not extract enough text from resume. Please try a different file." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      systemPrompt = `You are an expert resume parser. Extract structured information from the resume text provided. Return data using the tool provided. Extract the ACTUAL person's real information — do NOT fabricate or guess any data. If a field is genuinely not found in the text, use an empty string for text fields or empty array for skills.

Fields to extract:
- name: full name
- email: email address
- phone: phone number
- currentRole: current or most recent job title
- experience: brief summary of total experience
- education: highest education with degree and institution
- skills: array of ALL technical and soft skills mentioned
- summary: 2-3 sentence professional summary based on what's in the resume`;

      userPrompt = `Parse this resume:\n\n${resumeText.substring(0, 10000)}`;
    } else if (action === "enhance") {
      systemPrompt = `You are a career coach and resume optimization expert. Given the user's profile data, enhance each field for better market positioning. Make the summary more compelling, suggest additional relevant skills based on their experience, and improve the experience description. Keep changes realistic and professional. Return the enhanced data using the tool provided.`;
      userPrompt = `Enhance this profile for better job market positioning. Current role context: ${currentRole || "not specified"}\n\nProfile:\n${JSON.stringify(profileData, null, 2)}`;
    } else if (action === "career-paths") {
      systemPrompt = `You are a career advisor and job market expert. Given the user's skills, experience, and current role, suggest 5 specific positions/specializations they can apply for RIGHT NOW on job boards. These should be concrete, searchable job position titles — NOT generic career paths. For example: "SAP EWM Consultant", "SAP MM Functional Analyst", "Supply Chain Data Analyst" — real positions found on LinkedIn/Indeed. For each, provide a match percentage (50-98) based on skill alignment and a brief reason referencing their specific skills. Return results using the tool provided.`;
      userPrompt = `Based on this profile, suggest 5 specific job positions they can apply for today:\nCurrent Role: ${currentRole}\nSkills: ${profileData?.skills?.join(", ")}\nExperience: ${profileData?.experience}\nEducation: ${profileData?.education}`;
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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI did not return structured data" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
