import {
  checkExamParticipantStatus,
  checkIsExamCreator,
  createNewExamDB,
  getExamsByQuizset,
  getExamDetails,
  registerExamParticipant,
} from "../services/supabase.js";

export async function createNewExam(req, res) {
  const examBody = examSchemas.createExamSchema.safeParse(req.body);

  if (examBody.success) {
    // createNewExamDB handles creator participation inside.
    const exam = await createNewExamDB(examBody.data);
    res.status(200).json({ success: true, data: exam });
  } else {
    console.log(JSON.stringify(examBody));
    res.status(400).json({ success: false, error: examBody.error });
  }
}

export async function getExamsByQuizsetId(req, res) {
  try {
    const userId = req.headers["x-user-id"];
    const { quizsetId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const exams = await getExamsByQuizset(quizsetId, userId);

    const isExpired = (startTime, duration) => {
      const endTime = new Date(startTime).getTime() + duration * 60 * 1000;
      return Date.now() > endTime;
    };

    const filteredExams = exams.filter(
      (exam) => !isExpired(exam.start_time, exam.duration_minutes)
    );

    res.status(200).json({
      success: true,
      data: filteredExams,
    });
  } catch (error) {
    console.error("Error in getExamsByQuizsetController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch exams for quizset",
    });
  }
}

export async function getExamStatus(req, res) {
  const { examId } = req.query;
  const userId = req.headers["x-user-id"];

  if (!examId || !userId) {
    return res.status(400).json({
      success: false,
      error: "Exam ID and User ID are required",
    });
  }

  const { startTime, duration, title, isPublic, shuffle, participantsCount } =
    await getExamDetails(examId);

  // const isExpired = (startTime, duration) => {
  //   const endTime = new Date(startTime).getTime() + duration * 60 * 1000;
  //   return Date.now() > endTime;
  // };

  // let exam_state = "waiting";

  // if (Date.now() > new Date(startTime).getTime()) {
  //   exam_state = "running";
  // }
  // if (isExpired(startTime, duration)) {
  //   exam_state = "ended";
  // }

  const isExamParticipant = await checkExamParticipantStatus(examId, userId);

  if (isExamParticipant) {
    return res.status(200).json({
      status: "participant",
      startTime,
      duration,
      title,
      isPublic,
      shuffle,
      participantsCount,
    });
  } else {
    const isExamCreator = await checkIsExamCreator(examId, userId);
    if (isExamCreator) {
      return res.status(200).json({
        status: "creator",
        startTime,
        duration,
        title,
        isPublic,
        shuffle,
        participantsCount,
      });
    }

    return res.status(200).json({
      status: "notParticipant",
      startTime,
      duration,
      title,
      isPublic,
      shuffle,
      participantsCount,
    });
  }
}

export async function registerParticipant(req, res) {
  const examId = req.body.examId;
  const userId = req.headers["x-user-id"];

  if (!examId || !userId) {
    return res.status(400).json({
      success: false,
      error: "Exam ID and User ID are required",
    });
  }

  try {
    return res.status(200).json({
      success: true,
      data: await registerExamParticipant(examId, userId),
    });
  } catch (error) {
    console.error("Error in registerParticipantController:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to register participant",
    });
  }
}
