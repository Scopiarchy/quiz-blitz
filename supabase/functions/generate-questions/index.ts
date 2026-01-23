import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeneratedQuestion {
  question_text: string;
  answers: string[];
  correct_answer_index: number;
  time_limit: number;
}

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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const questionCount = parseInt(formData.get("questionCount") as string) || 5;
    const subject = formData.get("subject") as string || "";

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Read file content
    const fileContent = await file.text();
    
    // Upload to storage for record keeping
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    await supabaseClient.storage
      .from("quiz-documents")
      .upload(filePath, file, { contentType: file.type });

    // Generate questions using AI
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a quiz question generator. Based on the following document content${subject ? ` about "${subject}"` : ""}, generate exactly ${questionCount} multiple-choice quiz questions.

DOCUMENT CONTENT:
${fileContent.slice(0, 15000)}

REQUIREMENTS:
1. Each question should test understanding of key concepts from the document
2. Provide exactly 4 answer options for each question
3. Ensure questions are clear, educational, and progressively challenging
4. Vary question types: definitions, concepts, applications, comparisons
5. The correct answer should be randomly placed among the options

Respond with a JSON array of questions in this exact format:
[
  {
    "question_text": "What is the main topic discussed?",
    "answers": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer_index": 0,
    "time_limit": 20
  }
]

IMPORTANT: Respond ONLY with the JSON array, no other text.`;

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
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate questions" }),
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
    let questions: GeneratedQuestion[];
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found");
      }
      questions = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse generated questions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and clean questions
    const validQuestions = questions
      .filter(q => 
        q.question_text && 
        Array.isArray(q.answers) && 
        q.answers.length >= 2 &&
        typeof q.correct_answer_index === "number"
      )
      .map((q, index) => ({
        question_text: q.question_text,
        answers: q.answers.slice(0, 4).map(a => String(a)),
        correct_answer_index: Math.min(q.correct_answer_index, q.answers.length - 1),
        time_limit: q.time_limit || 20,
        order_index: index,
      }));

    return new Response(
      JSON.stringify({ questions: validQuestions }),
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
