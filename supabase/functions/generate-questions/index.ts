import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GenerateQuestionsRequest {
  sub_strand_id: string;
  question_type: "multiple_choice" | "short_answer" | "true_false" | "fill_blank";
  difficulty: "easy" | "medium" | "hard";
  count: number;
  cognitive_level?: "knowledge" | "comprehension" | "application" | "analysis";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sub_strand_id, question_type, difficulty, count, cognitive_level } =
      (await req.json()) as GenerateQuestionsRequest;

    // Validate inputs
    if (!sub_strand_id || !question_type || !difficulty || !count) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (count < 1 || count > 10) {
      return new Response(
        JSON.stringify({ error: "Count must be between 1 and 10" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch sub-strand with learning outcomes
    const { data: subStrand, error: subStrandError } = await supabase
      .from("cbc_sub_strands")
      .select(`
        id,
        name,
        specific_learning_outcomes,
        key_inquiry_questions,
        strand:cbc_strands(
          id,
          name,
          subject_code,
          level
        )
      `)
      .eq("id", sub_strand_id)
      .single();

    if (subStrandError || !subStrand) {
      return new Response(
        JSON.stringify({ error: "Sub-strand not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle the nested strand data (could be array or object from Supabase)
    const strandData = Array.isArray(subStrand.strand) ? subStrand.strand[0] : subStrand.strand;
    const strand = strandData as { name: string; subject_code: string; level: string } | null;
    
    if (!strand) {
      return new Response(
        JSON.stringify({ error: "Strand data not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const outcomes = subStrand.specific_learning_outcomes || [];
    const inquiryQuestions = subStrand.key_inquiry_questions || [];

    // Build the AI prompt
    const systemPrompt = `You are an expert Kenya CBC curriculum question writer. Generate high-quality assessment questions aligned to the Kenya Competency-Based Curriculum (CBC) guidelines set by KICD.

Guidelines:
- Questions must be age-appropriate for ${strand.level.replace("_", " ")}
- Align to the specific learning outcomes provided
- Use clear, simple language appropriate for Kenyan students
- Include culturally relevant examples (Kenyan names, places, context)
- For MCQs, ensure distractors are plausible but clearly incorrect
- For ${difficulty} difficulty: ${
      difficulty === "easy" ? "test basic recall and recognition"
      : difficulty === "medium" ? "test understanding and application"
      : "test analysis, synthesis, and evaluation"
    }`;

    const userPrompt = `Generate ${count} ${difficulty} ${question_type.replace("_", " ")} question(s) for:

Subject: ${strand.subject_code}
Level: ${strand.level.replace("_", " ")}
Strand: ${strand.name}
Sub-Strand: ${subStrand.name}

Learning Outcomes:
${Array.isArray(outcomes) ? outcomes.map((o, i) => `${i + 1}. ${o}`).join("\n") : outcomes}

Key Inquiry Questions:
${Array.isArray(inquiryQuestions) ? inquiryQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") : inquiryQuestions}

Cognitive Level: ${cognitive_level || "knowledge"}

Generate questions that directly assess these learning outcomes.`;

    // Define the tool schema for structured output
    const tools = [
      {
        type: "function",
        function: {
          name: "generate_questions",
          description: "Generate CBC-aligned assessment questions",
          parameters: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question_text: {
                      type: "string",
                      description: "The question text",
                    },
                    options: {
                      type: "array",
                      description: "Options for multiple choice (4 options A-D)",
                      items: {
                        type: "object",
                        properties: {
                          label: { type: "string" },
                          text: { type: "string" },
                          is_correct: { type: "boolean" },
                        },
                        required: ["label", "text", "is_correct"],
                      },
                    },
                    correct_answer: {
                      type: "string",
                      description: "The correct answer for non-MCQ questions",
                    },
                    explanation: {
                      type: "string",
                      description: "Brief explanation of the answer",
                    },
                    marks: {
                      type: "number",
                      description: "Suggested marks (1-5)",
                    },
                    topic: {
                      type: "string",
                      description: "Specific topic within the sub-strand",
                    },
                  },
                  required: ["question_text", "explanation", "marks", "topic"],
                },
              },
            },
            required: ["questions"],
          },
        },
      },
    ];

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools,
          tool_choice: { type: "function", function: { name: "generate_questions" } },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate questions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await aiResponse.json();
    
    // Extract the tool call response
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_questions") {
      return new Response(
        JSON.stringify({ error: "Unexpected AI response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generatedQuestions = JSON.parse(toolCall.function.arguments);

    // Enrich questions with metadata
    const enrichedQuestions = generatedQuestions.questions.map((q: Record<string, unknown>) => ({
      ...q,
      question_type,
      difficulty,
      cognitive_level: cognitive_level || "knowledge",
      sub_strand_id,
      sub_strand_name: subStrand.name,
      strand_name: strand.name,
      subject_code: strand.subject_code,
      level: strand.level,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        questions: enrichedQuestions,
        metadata: {
          sub_strand: subStrand.name,
          strand: strand.name,
          subject: strand.subject_code,
          level: strand.level,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating questions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
