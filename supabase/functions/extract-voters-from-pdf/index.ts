import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ error: 'PDF data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `তুমি একজন ভোটার তালিকা ডাটা এক্সট্র্যাক্টর। এই PDF/ছবি থেকে সব ভোটারের তথ্য বের করো।

প্রতিটি ভোটারের জন্য এই ফিল্ডগুলো বের করো:
- sl: ক্রমিক নম্বর (integer, বাংলা সংখ্যা হলে ইংরেজিতে কনভার্ট করো)
- voter_no: ভোটার নম্বর (string, বাংলা সংখ্যা হলে ইংরেজিতে কনভার্ট করো)
- name_bn: নাম বাংলায় (string)
- father_husband: পিতা/স্বামীর নাম (string)
- dob: জন্ম তারিখ (string, যেভাবে আছে সেভাবে)
- address: ঠিকানা (string)

শুধুমাত্র JSON array রিটার্ন করো, অন্য কিছু না। যদি কোনো ভোটার না পাও, খালি array [] রিটার্ন করো।`;

    // Call Gemini API directly
    // NOTE: Model availability changes over time and varies by project.
    // To prevent outages when a model name becomes unavailable, we try a small fallback list.
    const candidateModels = [
      // Newer
      "gemini-2.0-flash",
      // Common aliases
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest",
    ];

    const requestPayload = {
      contents: [
        {
          parts: [
            { text: systemPrompt + "\n\nএই ভোটার তালিকা থেকে সব ভোটারের তথ্য JSON array তে বের করো।" },
            {
              inline_data: {
                mime_type: "application/pdf",
                data: pdfBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8000,
      },
    };

    let response: Response | null = null;
    let lastErrorText = "";
    let usedModel: string | null = null;

    for (const model of candidateModels) {
      usedModel = model;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (response.ok) break;
      lastErrorText = await response.text();
      console.error("Gemini API error (model tried):", model, response.status, lastErrorText);
    }

    if (!response) {
      return new Response(
        JSON.stringify({ error: "Gemini API request failed to start" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!response.ok) {
      const errorText = lastErrorText || await response.text();
      console.error('Gemini API error (all models failed):', {
        status: response.status,
        triedModels: candidateModels,
        lastTriedModel: usedModel,
        errorText,
      });
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({
          error: 'Gemini API error: ' + errorText,
          triedModels: candidateModels,
          lastTriedModel: usedModel,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error('No content in Gemini response:', JSON.stringify(aiResponse));
      return new Response(
        JSON.stringify({ error: 'AI থেকে কোনো response পাওয়া যায়নি' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from AI response
    let voters = [];
    try {
      // Try to extract JSON from the response (AI might wrap it in markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        voters = JSON.parse(jsonMatch[0]);
      } else {
        voters = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      return new Response(
        JSON.stringify({ 
          error: 'AI response parse করতে সমস্যা হয়েছে',
          rawContent: content 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ voters }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
