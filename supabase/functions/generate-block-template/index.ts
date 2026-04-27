import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { htmlContent } = await req.json();

    if (!htmlContent) {
      throw new Error('Missing htmlContent');
    }

    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY not set');
    }

    const prompt = `
      You are an expert UI developer and template engineer.
      Your task is to convert the provided raw HTML block into a reusable Handlebars template and a corresponding JSON Schema.

      Rules:
      1. Identify all dynamic parts: text, image URLs, links, background colors, and repeat sections (like lists or cards).
      2. Replace them with Handlebars variables like {{ title }} or {{{ content }}} for HTML-supported text.
      3. For repeat sections, use {{#each items}}...{{/each}}.
      4. Generate a comprehensive JSON Schema (Draft 7) in the "schema" field of the response.
      5. The schema should include "title", "type", and "default" for each property. 
      6. Use appropriate "format" for strings (uri, color, textarea).
      7. Return ONLY a valid JSON object with "html_code" and "schema" fields. Do not include markdown code blocks.

      Input HTML:
      ${htmlContent}
    `;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that outputs only valid JSON strings.' },
          { role: 'user', content: prompt }
        ],
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to call DeepSeek API");
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // DeepSeek might sometimes wrap in ```json ... ```
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    return new Response(content, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
