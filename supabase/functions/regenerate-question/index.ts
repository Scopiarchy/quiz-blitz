import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { currentQuestion, quizTitle, quizDescription, allQuestions } = await req.json();

    if (!currentQuestion) {
      return new Response(
        JSON.stringify({ error: "No question provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from other questions
    const otherQuestions = allQuestions
      ?.filter((q: any) => q.question_text !== currentQuestion.question_text)
      ?.slice(0, 5)
      ?.map((q: any) => `- ${q.question_text}`)
      ?.join("\n") || "";

    const prompt = `You are a quiz question generator. Regenerate the following quiz question with a fresh, different approach while maintaining the same topic and difficulty level.

QUIZ CONTEXT:
Title: ${quizTitle || "General Quiz"}
Description: ${quizDescription || "A quiz"}

CURRENT QUESTION TO REGENERATE:
Question: ${currentQuestion.question_text}
Answers: ${currentQuestion.answers?.join(", ")}
Correct Answer: ${currentQuestion.answers?.[currentQuestion.correct_answer_index] || "First answer"}

${otherQuestions ? `OTHER QUESTIONS IN THIS QUIZ (for context, avoid duplicating):
${otherQuestions}` : ""}

REQUIREMENTS:
1. Create a NEW question on the same topic but with different wording/angle
2. Provide exactly 4 answer options
3. Make sure the question is clear and educational
4. The correct answer should be randomly placed among options
5. Keep similar difficulty level
6. Time limit should be ${currentQuestion.time_limit || 20} seconds

Respond with a JSON object in this exact format:
{
  "question_text": "Your new question here?",
  "answers": ["Option A", "Option B", "Option C", "Option D"],
  "correct_answer_index": 0,
  "time_limit": 20
}

IMPORTANT: Respond ONLY with the JSON object, no other text.`;

    console.log("Regenerating question for user:", user.id);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert educational quiz creator. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8, // Higher for more variety
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const errorText = await aiResponse.text();
      console.error("AI API error:", status, errorText);
      
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to regenerate question" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response
    let question;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found");
      }
      question = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse regenerated question" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate question
    if (!question.question_text || !Array.isArray(question.answers) || question.answers.length < 2) {
      return new Response(
        JSON.stringify({ error: "Invalid question format generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validatedQuestion = {
      question_text: question.question_text,
      answers: question.answers.slice(0, 4).map((a: any) => String(a)),
      correct_answer_index: Math.min(question.correct_answer_index || 0, question.answers.length - 1),
      time_limit: question.time_limit || currentQuestion.time_limit || 20,
    };

    console.log("Successfully regenerated question");

    return new Response(
      JSON.stringify({ question: validatedQuestion }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
