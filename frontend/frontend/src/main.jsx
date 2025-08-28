import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Route, BrowserRouter as Router, Routes } from "react-router";
import LoginPage from "./app/Auth";
import AuthWrapper from "./wrappers/AuthWrapper";
import { SessionProvider } from "./context/SessionContext";
import Quizset from "./app/Quizset";
import QuizGenerationFront from "./app/QuizGenerationFront";
import SonnerWrapper from "./wrappers/SonnerWrapper";
import Page404 from "./app/404";
import ExamContainer from "./app/ExamContainer";
import ExamsOnQuizset from "./app/ExamsOnQuizset";
import Auth from "./app/Auth";
import UserExams from "./app/UserExams";
import Experimental from "./app/experimental/Experimental.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SonnerWrapper>
      <SessionProvider>
        <Router>
          <Routes>
            <Route path="/experiment" element={<Experimental />} />
            <Route path="/not-found" element={<Page404 />} />
            <Route path="/auth" element={<App authRequired={true} />} />
            <Route path="/" element={<App />}>
              <Route path="/auth" element={<Auth />} />
              <Route index element={<QuizGenerationFront />} />
              <Route
                path="q/:quizsetId"
                element={
                  <AuthWrapper>
                    <Quizset />
                  </AuthWrapper>
                }
              />
              <Route
                path="xm/:quizsetId"
                element={
                  <AuthWrapper>
                    <ExamsOnQuizset />
                  </AuthWrapper>
                }
              />
              <Route
                path="exams"
                element={
                  <AuthWrapper>
                    <UserExams />
                  </AuthWrapper>
                }
              />

              <Route path="x/:examId" element={<ExamContainer />} />
            </Route>
          </Routes>
        </Router>
      </SessionProvider>
    </SonnerWrapper>
  </StrictMode>
);
