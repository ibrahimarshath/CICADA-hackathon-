import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AnalyticsRequest {
  type?: "visitors" | "service_clicks" | "summary";
  start_date?: string;
  end_date?: string;
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

    if (!supabaseServiceKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    }
    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL is not set");
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { type = "summary", start_date, end_date }: AnalyticsRequest =
      await req.json().catch(() => ({}));

    // Build date filter if provided
    let dateFilter = {};
    if (start_date || end_date) {
      dateFilter = {
        created_at: {
          ...(start_date ? { gte: start_date } : {}),
          ...(end_date ? { lte: end_date } : {}),
        },
      };
    }

    let result: any = {};

    if (type === "visitors" || type === "summary") {
      // Get visitor statistics
      let visitorsQuery = supabase
        .from("visitors")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (start_date || end_date) {
        if (start_date) {
          visitorsQuery = visitorsQuery.gte("created_at", start_date);
        }
        if (end_date) {
          visitorsQuery = visitorsQuery.lte("created_at", end_date);
        }
      }

      const { data: visitors, error: visitorsError, count: visitorsCount } =
        await visitorsQuery.limit(1000);

      if (visitorsError) {
        throw new Error(`Failed to fetch visitors: ${visitorsError.message}`);
      }

      result.visitors = {
        total: visitorsCount || 0,
        data: visitors || [],
      };
    }

    if (type === "service_clicks" || type === "summary") {
      // Get service click statistics
      let clicksQuery = supabase
        .from("service_clicks")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (start_date || end_date) {
        if (start_date) {
          clicksQuery = clicksQuery.gte("created_at", start_date);
        }
        if (end_date) {
          clicksQuery = clicksQuery.lte("created_at", end_date);
        }
      }

      const { data: clicks, error: clicksError, count: clicksCount } =
        await clicksQuery.limit(1000);

      if (clicksError) {
        throw new Error(`Failed to fetch service clicks: ${clicksError.message}`);
      }

      // Aggregate by service name
      const serviceStats: Record<string, number> = {};
      if (clicks) {
        clicks.forEach((click) => {
          const serviceName = click.service_name || "Unknown";
          serviceStats[serviceName] = (serviceStats[serviceName] || 0) + 1;
        });
      }

      result.service_clicks = {
        total: clicksCount || 0,
        by_service: serviceStats,
        data: clicks || [],
      };
    }

    if (type === "summary") {
      // Get additional summary statistics
      const { data: recentVisitors } = await supabase
        .from("visitors")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { data: recentClicks } = await supabase
        .from("service_clicks")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      result.summary = {
        total_visitors: result.visitors?.total || 0,
        total_service_clicks: result.service_clicks?.total || 0,
        last_visitor: recentVisitors?.created_at || null,
        last_click: recentClicks?.created_at || null,
        top_services: Object.entries(result.service_clicks?.by_service || {})
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([name, count]) => ({ name, count })),
      };
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analytics function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch analytics",
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

