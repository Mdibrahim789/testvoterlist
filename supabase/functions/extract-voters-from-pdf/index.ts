import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEBUG_VERSION = "2026-02-01-model-discovery-v1";

type ListedModel = {
  name: string; // without "models/" prefix
  displayName?: string;
  supportedGenerationMethods: string[];
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function listAvailableModels(apiKey: string): Promise<
  | { ok: true; models: ListedModel[] }
  | { ok: false; status: number; errorText: string }
> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const resp = await fetch(url);
  const text = await resp.text();

  if (!resp.ok) {
    return { ok: false, status: resp.status, errorText: text };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, status: 500, errorText: "ListModels returned non-JSON" };
  }

  const models: ListedModel[] = (parsed?.models ?? []).map((m: any) => ({
    name: String(m?.name ?? "").replace(/^models\//, ""),
    displayName: m?.displayName ? String(m.displayName) : undefined,
    supportedGenerationMethods: Array.isArray(m?.supportedGenerationMethods)
      ? m.supportedGenerationMethods.map((x: any) => String(x))
      : [],
  }));

  return { ok: true, models };
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function scoreModelName(name: string) {
  const n = name.toLowerCase();
  // Prefer gemini flash models for cost/speed, then pro.
  if (n.includes("flash")) return 0;
  if (n.includes("pro")) return 1;
  return 2;
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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return jsonResponse({ error: "Gemini API key not configured", debugVersion: DEBUG_VERSION }, 500);
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

    const requestPayload = {
      contents: [
        {
          parts: [
            {
              text:
                systemPrompt +
                "\n\nএই ভোটার তালিকা থেকে সব ভোটারের তথ্য JSON array তে বের করো।",
            },
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

    // 1) Always try a small set of common names (fast path)
    const hardcodedCandidates = [
      "gemini-flash-latest",
      "gemini-2.0-flash",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
    ];

    // 2) Then dynamically discover models available for THIS API key
    const listResult = await listAvailableModels(GEMINI_API_KEY);
    const discoveredModels =
      listResult.ok
        ? listResult.models
            .filter((m) => m.supportedGenerationMethods.includes("generateContent"))
            .map((m) => m.name)
            .filter((n) => n)
        : [];

    const candidateModels = uniq([...hardcodedCandidates, ...discoveredModels])
      .filter((n) => n.toLowerCase().includes("gemini"))
      .sort((a, b) => scoreModelName(a) - scoreModelName(b))
      .slice(0, 12);

    const extractTextFromGeminiResponse = (payload: any): string => {
      const parts = payload?.candidates?.[0]?.content?.parts;
      if (!Array.isArray(parts)) return "";
      return parts
        .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
        .join("")
        .trim();
    };

    let lastErrorText = "";
    let lastStatus: number | null = null;
    let usedModel: string | null = null;
    let aiResponse: any | null = null;
    let content = "";
    let finishReason: string | null = null;

    for (const model of candidateModels) {
      usedModel = model;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      lastStatus = resp.status;
      const respText = await resp.text();

      if (!resp.ok) {
        lastErrorText = respText;
        console.error("Gemini API error (model tried):", model, resp.status, lastErrorText);
        // rate-limit/credits errors won't be fixed by trying other models
        if (resp.status === 429) break;
        continue;
      }

      // Success status, but still might not contain text (safety / max tokens / unexpected response)
      try {
        aiResponse = JSON.parse(respText);
      } catch {
        lastErrorText = respText.slice(0, 2000);
        console.error("Gemini returned non-JSON despite 2xx:", model, lastErrorText);
        continue;
      }

      finishReason = aiResponse?.candidates?.[0]?.finishReason
        ? String(aiResponse.candidates[0].finishReason)
        : null;

      content = extractTextFromGeminiResponse(aiResponse);
      if (content) break;

      lastErrorText = `2xx but empty text. finishReason=${finishReason ?? "unknown"}`;
      console.error("Gemini empty content (model tried):", model, lastErrorText);
    }

    if (!content || !aiResponse) {
      // surface model discovery details so you can see what your key actually supports
      const discoveryDetails =
        listResult.ok
          ? {
              discoveredCount: listResult.models.length,
              discoveredGenerateContentCount: discoveredModels.length,
              discoveredSample: discoveredModels.slice(0, 20),
            }
          : {
              listModelsFailed: true,
              listModelsStatus: listResult.status,
              listModelsErrorText: listResult.errorText?.slice(0, 2000),
            };

      if (lastStatus === 429) {
        return jsonResponse(
          { error: "Rate limit exceeded. অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।", debugVersion: DEBUG_VERSION },
          429,
        );
      }

      const safety = aiResponse?.promptFeedback ?? aiResponse?.candidates?.[0]?.safetyRatings;
      const reasonHint = finishReason ? ` (finishReason=${finishReason})` : "";

      return jsonResponse(
        {
          error: "AI থেকে কোনো response পাওয়া যায়নি" + reasonHint,
          lastError: lastErrorText?.slice(0, 2000) || undefined,
          triedModels: candidateModels,
          lastTriedModel: usedModel,
          finishReason,
          safety,
          debugVersion: DEBUG_VERSION,
          ...discoveryDetails,
        },
        500,
      );
    }

    // Parse the JSON from AI response - handle markdown code blocks and incomplete JSON
    let voters: any[] = [];
    try {
      // First, try to extract JSON from markdown code block anywhere in the content
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
      let jsonContent = codeBlockMatch ? codeBlockMatch[1].trim() : content.trim();
      
      // Try to find JSON array pattern
      const jsonMatch = jsonContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          voters = JSON.parse(jsonMatch[0]);
        } catch {
          // JSON might be incomplete (cut off), try to fix it
          let fixedJson = jsonMatch[0];
          
          // Count open/close braces and brackets to fix incomplete JSON
          const openBrackets = (fixedJson.match(/\[/g) || []).length;
          const closeBrackets = (fixedJson.match(/\]/g) || []).length;
          const openBraces = (fixedJson.match(/\{/g) || []).length;
          const closeBraces = (fixedJson.match(/\}/g) || []).length;
          
          // Try to close incomplete objects
          if (openBraces > closeBraces) {
            // Find the last complete object by looking for the last "},"
            const lastCompleteObj = fixedJson.lastIndexOf('},');
            if (lastCompleteObj !== -1) {
              fixedJson = fixedJson.substring(0, lastCompleteObj + 1) + ']';
            } else {
              // Close remaining braces and brackets
              fixedJson += '}'.repeat(openBraces - closeBraces);
              fixedJson += ']'.repeat(openBrackets - closeBrackets);
            }
          } else if (openBrackets > closeBrackets) {
            fixedJson += ']'.repeat(openBrackets - closeBrackets);
          }
          
          try {
            voters = JSON.parse(fixedJson);
          } catch {
            // Last resort: extract complete objects only
            const objectMatches = jsonContent.match(/\{[^{}]*(?:"sl"|"voter_no"|"name_bn")[^{}]*\}/g);
            if (objectMatches && objectMatches.length > 0) {
              voters = objectMatches.map(obj => {
                try { return JSON.parse(obj); } catch { return null; }
              }).filter(Boolean);
            } else {
              throw new Error("Could not parse incomplete JSON");
            }
          }
        }
      } else {
        voters = JSON.parse(jsonContent);
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      return jsonResponse(
        { error: "AI response parse করতে সমস্যা হয়েছে", rawContent: content.slice(0, 1000), model: usedModel, debugVersion: DEBUG_VERSION },
        422,
      );
    }

    return jsonResponse({ voters, model: usedModel, debugVersion: DEBUG_VERSION });
  } catch (error) {
    console.error("Edge function error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error", debugVersion: DEBUG_VERSION },
      500,
    );
  }
});
