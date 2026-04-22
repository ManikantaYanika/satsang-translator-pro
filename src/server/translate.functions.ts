import { createServerFn } from "@tanstack/react-start";

type TranslateInput = {
  source_text: string;
  source_language: string;
  target_language: string;
  formality_level: number;
  domain: string;
  preserve_style: boolean;
  cultural_adaptation: boolean;
  literal_vs_natural: number;
  glossary_terms?: { source_term: string; target_term: string }[];
};

type TranslateResult = {
  translated_text: string;
  tone_detected: string;
  intent_detected: string;
  register_detected: string;
  confidence_score: number;
  translator_notes?: string;
  error?: string;
};

export const translateFn = createServerFn({ method: "POST" })
  .inputValidator((d: TranslateInput) => d)
  .handler(async ({ data }): Promise<TranslateResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        translated_text: "",
        tone_detected: "",
        intent_detected: "",
        register_detected: "",
        confidence_score: 0,
        error: "LOVABLE_API_KEY is not configured",
      };
    }

    const glossarySection =
      data.glossary_terms && data.glossary_terms.length > 0
        ? `\nUser glossary (ALWAYS apply these exact mappings):\n${data.glossary_terms
            .map((g) => `- "${g.source_term}" -> "${g.target_term}"`)
            .join("\n")}`
        : "";

    const systemPrompt = `You are a professional translator specializing in style-aware, context-preserving translation. Your task is to translate text while maintaining the original tone, intent, and stylistic voice. You are NOT a literal word-for-word translator — you translate meaning, emotion, and style.

Translation parameters:
- Source language: ${data.source_language}
- Target language: ${data.target_language}
- Formality level: ${data.formality_level}/100 (0=casual, 100=ultra-formal)
- Domain: ${data.domain}
- Preserve original style: ${data.preserve_style}
- Cultural adaptation: ${data.cultural_adaptation}
- Literalness: ${data.literal_vs_natural}/100 (0=very literal, 100=very natural)${glossarySection}`;

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: data.source_text },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_translation",
                description: "Return the style-aware translation with metadata",
                parameters: {
                  type: "object",
                  properties: {
                    translated_text: { type: "string" },
                    tone_detected: {
                      type: "string",
                      enum: ["Formal", "Casual", "Poetic", "Technical", "Conversational"],
                    },
                    intent_detected: {
                      type: "string",
                      enum: ["Informational", "Persuasive", "Emotional", "Instructional"],
                    },
                    register_detected: {
                      type: "string",
                      enum: ["Professional", "Academic", "Colloquial", "Literary"],
                    },
                    confidence_score: { type: "integer", minimum: 0, maximum: 100 },
                    translator_notes: { type: "string" },
                  },
                  required: [
                    "translated_text",
                    "tone_detected",
                    "intent_detected",
                    "register_detected",
                    "confidence_score",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_translation" } },
        }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        if (resp.status === 429) {
          return {
            translated_text: "",
            tone_detected: "",
            intent_detected: "",
            register_detected: "",
            confidence_score: 0,
            error: "Rate limit reached. Please wait a moment and try again.",
          };
        }
        if (resp.status === 402) {
          return {
            translated_text: "",
            tone_detected: "",
            intent_detected: "",
            register_detected: "",
            confidence_score: 0,
            error: "AI credits exhausted. Add credits in Workspace → Usage.",
          };
        }
        console.error("Gateway error", resp.status, txt);
        return {
          translated_text: "",
          tone_detected: "",
          intent_detected: "",
          register_detected: "",
          confidence_score: 0,
          error: `Translation service error (${resp.status})`,
        };
      }

      const json = await resp.json();
      const call = json.choices?.[0]?.message?.tool_calls?.[0];
      if (!call) {
        return {
          translated_text: "",
          tone_detected: "",
          intent_detected: "",
          register_detected: "",
          confidence_score: 0,
          error: "No translation returned",
        };
      }
      const args = JSON.parse(call.function.arguments);
      return {
        translated_text: args.translated_text,
        tone_detected: args.tone_detected,
        intent_detected: args.intent_detected,
        register_detected: args.register_detected,
        confidence_score: args.confidence_score,
        translator_notes: args.translator_notes,
      };
    } catch (e) {
      console.error("Translate error", e);
      return {
        translated_text: "",
        tone_detected: "",
        intent_detected: "",
        register_detected: "",
        confidence_score: 0,
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  });
