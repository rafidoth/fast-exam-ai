import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { generateTitle } from "./interactionWithLLM.js";

dotenv.config();

export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

function getSupabaseServiceClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase URL or Service Role Key is not defined in environment variables."
    );
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

const supabase = getSupabaseServiceClient();
// const supabaseService = getSupabaseServiceClient();

// user
export const getUserById = async (userId) => {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error) {
    console.error("Error fetching user:", error);
    return false;
  }
  return data.user;
};

// Quizsets
export const createNewQuizSet = async (context, userId, visibility) => {
  const title = await generateTitle(context);
  const { data, error } = await supabase
    .from("quizsets")
    .insert({ title, userId, visibility })
    .select();
  if (error) {
    console.error(error);
    return null;
  }
  console.log("quizset created : ", data);
  return data[0];
};

export const retrieveQuizsetTitle = async (quizsetId) => {
  const { data, error } = await supabase
    .from("quizsets")
    .select("title")
    .eq("id", quizsetId)
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return data.title;
};

export const saveMcqQuizzesDB = async (quizzes, quizsetId) => {
  console.log(
    `Saving quizzes to DB for quizset ID: going to push ${quizzes.length} quizzes`
  );

  let success = true;
  quizzes.forEach(async (quiz) => {
    const saveQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .insert({
          quizsetId,
          question: quiz.question,
          difficulty: quiz.difficulty,
          type: quiz.type,
          position: quiz.position,
        })
        .select();
      if (error) {
        console.error(error);
      } else {
        success = success && true;
      }
      return data[0].id;
    };

    const saveAnswers = async (questionId) => {
      const { data, error } = await supabase
        .from("answers")
        .insert({
          questionId,
          answer: quiz.answer,
          answerExplanation: quiz.answerExplanation,
        })
        .select();
      if (error) {
        console.error(error);
      } else {
        success = success && true;
      }
    };

    const saveChoices = async (questionId) => {
      quiz.choices.forEach(async (choice, i) => {
        const { data, error } = await supabase
          .from("choices")
          .insert({
            questionId,
            choiceNumber: i,
            choiceText: choice,
          })
          .select();
        if (error) {
          console.error(error);
        } else {
          success = success && true;
        }
      });
    };

    const questionId = await saveQuestions();
    await saveAnswers(questionId);
    await saveChoices(questionId);
  });

  if (success) {
    console.log("All quizzes saved successfully with quizset ID:", quizsetId);
  } else {
    throw new Error("Failed to save some quizzes for quizset ID: " + quizsetId);
  }
};

export const retrieveMcqQuizset = async (quizsetId) => {
  try {
    console.log(`Retrieving quiz set with ID: ${quizsetId}`);
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("quizsetId", quizsetId);

    if (questionsError) {
      console.error("Error retrieving questions:", questionsError);
      return null;
    }

    const formattedQuizzes = [];

    for (const question of questions) {
      const { data: answers, error: answersError } = await supabase
        .from("answers")
        .select("*")
        .eq("questionId", question.id)
        .single();

      if (answersError) {
        console.error(
          `Error retrieving answer for question ${question.id}:`,
          answersError
        );
        continue;
      }

      // Get the choices for this question
      const { data: choices, error: choicesError } = await supabase
        .from("choices")
        .select("*")
        .eq("questionId", question.id)
        .order("choiceNumber", { ascending: true });

      if (choicesError) {
        console.error(
          `Error retrieving choices for question ${question.id}:`,
          choicesError
        );
        continue;
      }

      // Extract just the choice text from each choice object
      const choiceTexts = choices.map((choice) => choice.choiceText);

      // Create a formatted quiz object matching the structure in quizController.js
      try {
        const formattedQuiz = {
          position: question.position,
          question: question.question,
          choices: choiceTexts,
          answer: parseInt(answers.answer), // Assuming this is the index of the correct answer
          answerExplanation: answers.answerExplanation,
          difficulty: question.difficulty,
          type: question.type || "mcq",
        };
        formattedQuizzes.push(formattedQuiz);
      } catch (error) {
        console.error("Error formatting quiz:", error);
        continue;
      }
    }
    return formattedQuizzes;
  } catch (error) {
    console.error("Error in retrieveMcqQuizset:", error);
    return null;
  }
};

export const saveContextDB = async (context, quizsetId) => {
  const { data, error } = await supabase
    .from("contexts")
    .insert({ quizsetId, content: context })
    .select();
  if (error) {
    console.error(error);
  } else {
    console.log("Context saved to DB for quizset ID:", quizsetId);
  }
};

export const retrieveContextDB = async (quizsetId) => {
  const { data, error } = await supabase
    .from("contexts")
    .select("*")
    .eq("quizsetId", quizsetId)
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return data.content;
};

export const getUserQuizsets = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("quizsets")
      .select("id, title, created_at, visibility")
      .eq("userId", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching user quizsets:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in getUserQuizsets:", error);
    return [];
  }
};

export const checkIsQuizsetValid = async (quizsetId) => {
  const { data, error } = await supabase
    .from("quizsets")
    .select("id")
    .eq("id", quizsetId)
    .single();
  if (error) {
    console.error(error);
    return false;
  }
  return true;
};

export const updateQuizsetTitle = async (quizsetId, newTitle, userId) => {
  try {
    // First verify the quizset belongs to this user
    const { data: quizsetData, error: quizsetError } = await supabase
      .from("quizsets")
      .select("userId")
      .eq("id", quizsetId)
      .single();

    if (quizsetError) {
      console.error("Error fetching quizset:", quizsetError);
      return { success: false, error: "Quizset not found" };
    }

    if (quizsetData.userId !== userId) {
      return {
        success: false,
        error: "Unauthorized: You don't own this quizset",
      };
    }

    // Update the title
    const { data, error } = await supabase
      .from("quizsets")
      .update({ title: newTitle })
      .eq("id", quizsetId)
      .select();

    if (error) {
      console.error("Error updating quizset title:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error in updateQuizsetTitle:", error);
    return { success: false, error: error.message };
  }
};

// Exams
export const createNewExamDB = async (exam) => {
  const { data, error } = await supabase
    .from("exams")
    .insert({
      title: exam.title,
      start_time: exam.startTime,
      duration_minutes: exam.duration,
      quizsetId: exam.quizSetId,
      creatorId: exam.creatorId,
    })
    .select();

  const examId = data[0].id;
  console.log(examId);
  if (error) {
    console.error(error);
  } else {
    console.log("Exam added to DB");
    const { data, error } = await supabase.from("examPreferences").insert({
      examId,
      shuffle: exam.shuffleQuestions,
      isPublic: exam.isPublic,
    });
    if (error) {
      // we have to delete the exam here.
      console.error(error);
    } else {
      console.log("Exam preferences added to DB");
      if (exam.creatorParticipationAllowed) {
        const { data, error } = await supabase.from("examParticipants").insert({
          examId,
          userId: exam.creatorId,
        });
        if (error) {
          console.error(error);
        } else {
          console.log("Creator added as participant");
        }
      }
    }
  }
  return data[0];
};

export const getExamsByQuizset = async (quizsetId, userId) => {
  try {
    console.log("Fetching exams by quizset:", quizsetId);
    const { data, error } = await supabase
      .from("exams")
      .select(
        `
        id, 
        title, 
        start_time, 
        duration_minutes,
        examPreferences (shuffle, isPublic)
      `
      )
      .eq("quizsetId", quizsetId)
      .eq("creatorId", userId);

    if (error) {
      console.error("Error fetching exams by quizset:", error);
      return [];
    }
    console.log(data);

    return data;
  } catch (error) {
    console.error("Unexpected error in getExamsByQuizset:", error);
    return [];
  }
};

export const checkExamParticipantStatus = async (examId, userId) => {
  const { data, error } = await supabase
    .from("examParticipants")
    .select("*")
    .eq("examId", examId)
    .eq("userId", userId)
    .single();
  if (error) {
    console.error(`${userId} is not participant of exam with ${examId}`);
    return false;
  }
  return true;
};

export const registerExamParticipant = async (examId, userId) => {
  const { data, error } = await supabase
    .from("examParticipants")
    .insert({
      examId,
      userId,
    })
    .select();

  if (error) {
    console.error("Error in registerExamParticipant:", error);
    return false;
  }
  return true;
};

export const checkIsExamCreator = async (examId, userId) => {
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("id", examId)
    .eq("creatorId", userId)
    .single();
  if (error) {
    console.error("Error checking exam creator:", error);
    return false;
  } else {
    return data.creatorId;
  }
};

export const getExamDetails = async (examId) => {
  const { data, error } = await supabase
    .from("exams")
    .select(
      "start_time, duration_minutes, title, examPreferences(shuffle, isPublic), examParticipants(count)"
    )
    .eq("id", examId)
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  console.log(data);

  return {
    startTime: data.start_time,
    duration: data.duration_minutes,
    title: data.title,
    shuffle: data.examPreferences.shuffle,
    isPublic: data.examPreferences.isPublic,
    participantsCount: data.examParticipants[0].count,
  };
};
