import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LessonContentRequest {
  topic: string;
  sub_topic?: string;
  subject_name: string;
  grade_level: string;
  duration_minutes: number;
  learning_outcomes?: string[];
  key_inquiry_questions?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: LessonContentRequest = await req.json();
    const { 
      topic, 
      sub_topic, 
      subject_name, 
      grade_level, 
      duration_minutes, 
      learning_outcomes = [],
      key_inquiry_questions = [] 
    } = body;

    if (!topic || !subject_name || !grade_level) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: topic, subject_name, grade_level" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert CBC (Competency-Based Curriculum) lesson planning assistant for Kenya.
You help teachers create engaging, learner-centered lesson content that aligns with KICD standards.
Your lesson content should be practical, age-appropriate, and promote critical thinking and competency development.
Always structure lessons with clear teacher and learner activities.`;

    const userPrompt = `Generate lesson content for:
- Subject: ${subject_name}
- Grade: ${grade_level}
- Topic: ${topic}${sub_topic ? ` (Sub-topic: ${sub_topic})` : ''}
- Duration: ${duration_minutes} minutes
${learning_outcomes.length > 0 ? `- Learning Outcomes:\n${learning_outcomes.map((o, i) => `  ${i + 1}. ${o}`).join('\n')}` : ''}
${key_inquiry_questions.length > 0 ? `- Key Inquiry Questions:\n${key_inquiry_questions.map((q, i) => `  ${i + 1}. ${q}`).join('\n')}` : ''}

Use the generate_lesson_content tool to provide the lesson content.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        tools: [
          {
            type: "function",
            function: {
              name: "generate_lesson_content",
              description: "Generate structured lesson content for CBC-aligned teaching",
              parameters: {
                type: "object",
                properties: {
                  introduction: {
                    type: "string",
                    description: "An engaging lesson introduction (2-3 sentences) that captures learner attention and connects to prior knowledge"
                  },
                  lesson_development: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        step: { type: "number", description: "Step number (1, 2, 3...)" },
                        activity: { type: "string", description: "Name of the activity" },
                        time: { type: "string", description: "Time allocation (e.g., '10 min')" },
                        teacher_activity: { type: "string", description: "What the teacher does" },
                        learner_activity: { type: "string", description: "What learners do" },
                        resources: { type: "string", description: "Required resources/materials" }
                      },
                      required: ["step", "activity", "time", "teacher_activity", "learner_activity"]
                    },
                    description: "3-5 lesson development steps with teacher and learner activities"
                  },
                  conclusion: {
                    type: "string",
                    description: "Lesson conclusion/wrap-up summarizing key learning points"
                  },
                  assessment_questions: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-4 assessment questions to check understanding"
                  },
                  suggested_teaching_aids: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of recommended teaching aids and resources"
                  }
                },
                required: ["introduction", "lesson_development", "conclusion", "assessment_questions"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_lesson_content" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate lesson content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_lesson_content") {
      console.error("Unexpected response format:", data);
      return new Response(
        JSON.stringify({ error: "Invalid response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lessonContent = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: lessonContent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-lesson-content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
