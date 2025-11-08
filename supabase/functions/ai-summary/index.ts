import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SummaryRequest {
  resume_path?: string;
  application_id?: string;
  text?: string;
  stats?: {
    total_visitors?: number;
    total_applicants?: number;
    total_service_clicks?: number;
    top_service?: string;
    last_visitor?: string | null;
    last_click?: string | null;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!supabaseServiceKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    }
    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL is not set");
    }
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { resume_path, application_id, text, stats }: SummaryRequest = await req.json();

    let contentToSummarize = text || "";

    // If resume_path is provided, download and extract text
    if (resume_path && !text) {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("resumes")
        .download(resume_path);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download resume: ${downloadError?.message}`);
      }

      // For now, we'll use OpenAI to extract text from PDF
      // In production, you might want to use a PDF parsing library
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // Use OpenAI to extract text from PDF
      const extractResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
              content: "Extract all text from this PDF resume. Return only the text content, no formatting."
            },
            {
              role: "user",
              content: `Extract text from this PDF (base64 encoded): ${base64.substring(0, 1000)}...`
            }
          ],
          max_tokens: 2000,
        }),
      });

      if (!extractResponse.ok) {
        throw new Error("Failed to extract text from PDF");
      }

      const extractData = await extractResponse.json();
      contentToSummarize = extractData.choices[0]?.message?.content || "";
    }

    // If stats are provided, generate analytics summary instead
    if (stats && !contentToSummarize) {
      const statsText = `Website Analytics Summary:
- Total Visitors: ${stats.total_visitors || 0}
- Total Applicants: ${stats.total_applicants || 0}
- Total Service Clicks: ${stats.total_service_clicks || 0}
- Top Service: ${stats.top_service || 'N/A'}
- Last Visitor: ${stats.last_visitor || 'N/A'}
- Last Service Click: ${stats.last_click || 'N/A'}`;

      // Generate AI summary using OpenAI
      const summaryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
              content: "You are an expert business analyst. Create a concise, insightful summary of website analytics data. Highlight key trends, patterns, and actionable insights. Keep it under 200 words."
            },
            {
              role: "user",
              content: `Analyze this website analytics data and provide insights:\n\n${statsText}`
            }
          ],
          max_tokens: 300,
          temperature: 0.3,
        }),
      });

      if (!summaryResponse.ok) {
        const errorData = await summaryResponse.text();
        throw new Error(`OpenAI API error: ${errorData}`);
      }

      const summaryData = await summaryResponse.json();
      const summary = summaryData.choices[0]?.message?.content;

      if (!summary) {
        throw new Error("No summary returned from OpenAI");
      }

      return new Response(
        JSON.stringify({
          success: true,
          summary: summary,
          generated_at: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!contentToSummarize) {
      throw new Error("No content provided to summarize");
    }

    // Generate AI summary using OpenAI
    const summaryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "You are an expert resume analyzer. Create a concise, professional summary highlighting key qualifications, experience, and skills. Keep it under 200 words."
          },
          {
            role: "user",
            content: `Summarize this resume content:\n\n${contentToSummarize}`
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!summaryResponse.ok) {
      const errorData = await summaryResponse.text();
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const summaryData = await summaryResponse.json();
    const summary = summaryData.choices[0]?.message?.content;

    if (!summary) {
      throw new Error("No summary returned from OpenAI");
    }

    // If application_id is provided, update the application with the summary
    if (application_id) {
      try {
        await supabase
          .from("applications")
          .update({ ai_summary: summary })
          .eq("id", application_id);
      } catch (updateError) {
        console.warn("Failed to update application with summary:", updateError);
        // Continue anyway - summary is still returned
      }
    }

    // If resume_path is provided and resumes table exists, update it
    if (resume_path) {
      try {
        // Try to find resume by path or create/update
        const { data: existingResume } = await supabase
          .from("resumes")
          .select("id")
          .eq("pdf_url", resume_path)
          .single();

        if (existingResume) {
          await supabase
            .from("resumes")
            .update({ ai_summary: summary })
            .eq("id", existingResume.id);
        }
      } catch (resumeError) {
        console.warn("Failed to update resume with summary:", resumeError);
        // Continue anyway - summary is still returned
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: summary,
        generated_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-summary function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate summary",
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

