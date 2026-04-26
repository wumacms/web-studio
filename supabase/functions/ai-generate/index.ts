import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt, context } = await req.json();

    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not set");
    }

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
            content: `You are an AI Copywriter and UI Assistant for a website builder called "Web Studio". 
            Generate high-quality, professional, and engaging content based on the user's prompt and context. 
            
            Context: ${context || "General website content"}
            
            Special Instruction:
            1. If the Context provided is a JSON string (object or array), and the prompt asks for structural or bulk changes (e.g., "change colors", "add a feature"), you should return a valid JSON string that reflects these changes while maintaining the original structure.
            2. If the prompt is a simple text request, return plain text.
            
            Rules:
            1. Return ONLY the generated content (text or JSON string).
            2. Do not include any introductory phrases or markdown code blocks (like \`\`\`json).
            3. Match the tone of a professional, modern website.`,
          },
          { role: "user", content: prompt },
        ],
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to call DeepSeek API");
    }

    const data = await response.json();
    const text = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ text }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
