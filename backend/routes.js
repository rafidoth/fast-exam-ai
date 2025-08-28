import {
  createNewExam,
  getExamsByQuizsetId,
  getExamStatus,
  registerParticipant,
} from "./controllers/examControllers.js";

import {
  generateQuizzes,
  getQuizset,
} from "./controllers/quizController.js";
import {
  getUserQuizsetsController,
  updateQuizsetTitleController,
} from "./controllers/quizsetControllers.js";

function printUrl(req, res, next) {
  console.log(`[${req.method}]`, req.url);
  next();
}

export function runRouter(app) {
  app.post("/api/generate-q", printUrl, generateQuizzes);
  app.get("/api/q/:quizsetId", printUrl, getQuizset);
  app.get("/api/q/:quizsetId/exams", printUrl, getExamsByQuizsetId);
  app.patch("/api/q/:quizsetId/update-title", printUrl, updateQuizsetTitleController);
  app.post("/api/exam", printUrl, createNewExam);
  app.get("/api/exam/status", printUrl, getExamStatus);
  app.get("/api/exam/participant", printUrl, registerParticipant);
  app.get("/api/exams/", printUrl, () => { /* ...existing code... */ });
  app.get("/api/user/quizsets", printUrl, getUserQuizsetsController);
}




