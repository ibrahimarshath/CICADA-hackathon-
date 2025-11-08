import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ParseRequest {
  resume_path: string;
  job_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!supabaseServiceKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    }
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { resume_path, job_id }: ParseRequest = await req.json();

    if (!resume_path) {
      return new Response(
        JSON.stringify({ error: "resume_path is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 1: Download PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("resumes")
      .download(resume_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download resume: ${downloadError?.message}`);
    }

    // Convert file to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Step 2: Send to OpenAI for parsing
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert resume parser. Extract the following information from the resume and return it as JSON:
{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "summary": "Professional summary or objective",
  "experience": [
    {
      "company": "Company name",
      "position": "Job title",
      "duration": "Time period",
      "description": "Key responsibilities and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "School/University name",
      "year": "Graduation year"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "certifications": ["cert1", "cert2"],
  "languages": ["language1", "language2"]
}

Be precise and extract all available information. If a field is not found, use null or empty array.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Parse this resume and extract all information. Return only valid JSON, no additional text."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Parse JSON from OpenAI response
    let parsedData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      parsedData = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON object
      const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        parsedData = JSON.parse(jsonObjectMatch[0]);
      } else {
        throw new Error(`Failed to parse JSON from OpenAI response: ${content}`);
      }
    }

    // Step 3: Compute fit score if job_id is provided
    let fitScore: number | null = null;
    if (job_id) {
      // Fetch job requirements
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("skills, requirements, description")
        .eq("id", job_id)
        .single();

      if (!jobError && job) {
        // Calculate fit score based on skills match
        const jobSkills = Array.isArray(job.skills) ? job.skills.map((s: string) => s.toLowerCase()) : [];
        const candidateSkills = Array.isArray(parsedData.skills) 
          ? parsedData.skills.map((s: string) => s.toLowerCase()) 
          : [];

        const matchingSkills = candidateSkills.filter((skill: string) => 
          jobSkills.some((js: string) => js.includes(skill) || skill.includes(js))
        );

        // Calculate score: (matching skills / total job skills) * 100
        if (jobSkills.length > 0) {
          fitScore = Math.round((matchingSkills.length / jobSkills.length) * 100);
        } else {
          fitScore = 50; // Default score if no skills specified
        }

        // Add experience bonus
        if (parsedData.experience && Array.isArray(parsedData.experience) && parsedData.experience.length > 0) {
          fitScore = Math.min(100, fitScore + 10);
        }
      }
    }

    // Step 4: Return parsed data and score
    const result = {
      success: true,
      data: parsedData,
      fit_score: fitScore,
      parsed_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error parsing resume:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to parse resume",
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
