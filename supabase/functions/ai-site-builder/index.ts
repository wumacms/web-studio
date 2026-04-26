import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { prompt } = await req.json();

    if (!DEEPSEEK_API_KEY) throw new Error("DEEPSEEK_API_KEY is not set");

    // 1. Fetch available templates from database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { data: templates, error: tplError } = await supabase
      .from('site_templates')
      .select('id, name, description');
    
    if (tplError) throw tplError;

    const templateList = templates?.map(t => `- ID: "${t.id}", Name: "${t.name}"`).join('\n') || "No templates available";

    // 2. Ask AI to pick a template and generate content
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        messages: [
          {
            role: "system",
            content: `You are an AI Site Architect for "Web Studio". 
            Based on the user's prompt, select the best template from the list below and generate tailored content.
            
            Available Templates:
            ${templateList}
            
            When generating content, use these common Section IDs as keys in the "content" object (they are standard across our templates):
            - "hero-1": For hero sections (fields: title, subtitle, badge, primaryCta, secondaryCta)
            - "features-1": For feature lists (fields: title, subtitle, features: Array<{title, desc}>)
            - "stats-1": For statistics (fields: stats: Array<{label, value, color}>)
            - "split-1": For split content/image sections (fields: title, subtitle, features: Array<string>, imageGradient)
            - "news-1": For blog/news lists (fields: title, subtitle, cta, posts: Array<{title, excerpt, color}>)
            - "faq-1": For frequently asked questions (fields: title, items: Array<{question, answer}>)
            
            Return ONLY a valid JSON object. 
            The structure must match:
            {
              "siteName": "A creative, short and catchy name for the website based on the prompt",
              "templateId": "The EXACT UUID of the selected template",
              "content": {
                "section-id": { "field": "value", ... }
              }
            }`,
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to call DeepSeek API");
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
