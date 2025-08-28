import { getUserQuizsets, updateQuizsetTitle } from "../services/supabase.js";

export async function getUserQuizsetsController(req, res) {
  try {
    const userId = req.headers["x-user-id"] || req.query.userId;
    const limit = parseInt(req.query.limit) || 10;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const quizsets = await getUserQuizsets(userId, limit);

    res.status(200).json({
      success: true,
      data: quizsets,
    });
  } catch (error) {
    console.error("Error in getUserQuizsetsController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user quizsets",
    });
  }
}

export async function updateQuizsetTitleController(req, res) {
  try {
    const userId = req.headers["x-user-id"];
    const { quizsetId } = req.params;
    const { title } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Title cannot be empty",
      });
    }

    const result = await updateQuizsetTitle(quizsetId, title, userId);

    if (!result.success) {
      return res.status(403).json(result);
    }

    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in updateQuizsetTitleController:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update quizset title",
    });
  }
}
