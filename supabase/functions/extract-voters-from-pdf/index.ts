import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEBUG_VERSION = "2026-02-04-lovable-ai-v1";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      return jsonResponse({ error: "PDF data is required", debugVersion: DEBUG_VERSION }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return jsonResponse({ error: "Lovable API key not configured", debugVersion: DEBUG_VERSION }, 500);
    }

    const systemPrompt = `তুমি একজন ভোটার তালিকা ডাটা এক্সট্র্যাক্টর। এই PDF/ছবি থেকে সব ভোটারের তথ্য বের করো।

প্রতিটি ভোটারের জন্য এই ফিল্ডগুলো বের করো:
- sl: ক্রমিক নম্বর (integer, বাংলা সংখ্যা হলে ইংরেজিতে কনভার্ট করো)
- voter_no: ভোটার নম্বর (string, বাংলা সংখ্যা হলে ইংরেজিতে কনভার্ট করো)
- name_bn: নাম বাংলায় (string)
- father_husband: পিতা/স্বামীর নাম (string)
- dob: জন্ম তারিখ (string, যেভাবে আছে সেভাবে)
- address: ঠিকানা (string)

গুরুত্বপূর্ণ: শুধুমাত্র JSON array রিটার্ন করো, অন্য কিছু না। কোনো ব্যাখ্যা বা markdown code fence দিও না। সরাসরি [ দিয়ে শুরু করো এবং ] দিয়ে শেষ করো। যদি কোনো ভোটার না পাও, খালি array [] রিটার্ন করো।`;

    const userPrompt = `এই ভোটার তালিকা থেকে সব ভোটারের তথ্য JSON array তে বের করো। শুধু JSON array দাও, কোনো ব্যাখ্যা দিও না।`;

    // Use Lovable AI Gateway with vision-capable model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 8000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return jsonResponse(
          { error: "Rate limit exceeded. অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।", debugVersion: DEBUG_VERSION },
          429
        );
      }
      if (response.status === 402) {
        return jsonResponse(
          { error: "Credits শেষ। অনুগ্রহ করে Lovable AI তে ক্রেডিট যোগ করুন।", debugVersion: DEBUG_VERSION },
          402
        );
      }

      return jsonResponse(
        { error: "AI Gateway error", details: errorText.slice(0, 500), debugVersion: DEBUG_VERSION },
        500
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse?.choices?.[0]?.message?.content?.trim() || "";

    if (!content) {
      return jsonResponse(
        { error: "AI থেকে কোনো response পাওয়া যায়নি", debugVersion: DEBUG_VERSION },
        500
      );
    }

    // Parse the JSON from AI response - handle markdown code blocks and truncated output
    let voters: any[] = [];
    try {
      const normalizeAiText = (text: string) => {
        let t = text.trim();

        // Remove markdown code fences if present
        const firstFence = t.indexOf("```");
        if (firstFence !== -1) t = t.slice(firstFence);
        t = t.replace(/^```\s*(?:json)?\s*/i, "");
        t = t.replace(/\s*```\s*$/i, "");
        t = t.replace(/```/g, "");
        return t.trim();
      };

      const extractCompleteJsonObjects = (text: string) => {
        const objs: string[] = [];
        let depth = 0;
        let start = -1;
        let inString = false;
        let escape = false;

        for (let i = 0; i < text.length; i++) {
          const ch = text[i];

          if (inString) {
            if (escape) {
              escape = false;
              continue;
            }
            if (ch === "\\") {
              escape = true;
              continue;
            }
            if (ch === '"') {
              inString = false;
            }
            continue;
          }

          if (ch === '"') {
            inString = true;
            continue;
          }

          if (ch === "{") {
            if (depth === 0) start = i;
            depth++;
            continue;
          }

          if (ch === "}") {
            if (depth > 0) depth--;
            if (depth === 0 && start !== -1) {
              objs.push(text.slice(start, i + 1));
              start = -1;
            }
          }
        }

        return objs;
      };

      const normalized = normalizeAiText(content);
      const arrayStart = normalized.indexOf("[");
      if (arrayStart === -1) throw new Error("No JSON array start found");

      const fromArray = normalized.slice(arrayStart);

      // Best case: there's a closing bracket
      const lastCloseBracket = fromArray.lastIndexOf("]");
      if (lastCloseBracket !== -1) {
        const maybeArray = fromArray.slice(0, lastCloseBracket + 1);
        voters = JSON.parse(maybeArray);
      } else {
        // Truncated output: salvage complete objects only
        const objectTexts = extractCompleteJsonObjects(fromArray);
        if (!objectTexts.length) throw new Error("No complete JSON objects found");

        voters = objectTexts
          .map((obj) => {
            try {
              return JSON.parse(obj);
            } catch {
              return null;
            }
          })
          .filter(Boolean);
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      return jsonResponse(
        {
          error: "AI response parse করতে সমস্যা হয়েছে",
          rawContent: content.slice(0, 1000),
          debugVersion: DEBUG_VERSION,
        },
        422
      );
    }

    return jsonResponse({ voters, debugVersion: DEBUG_VERSION });
  } catch (error) {
    console.error("Edge function error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error", debugVersion: DEBUG_VERSION },
      500
    );
  }
});
