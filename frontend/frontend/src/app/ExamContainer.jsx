import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useSession } from "../context/SessionContext";
import ExamUI from "./UI/ExamUI";
import { getExamStatus } from "../api";
import { io } from "socket.io-client";
import { format, isEqual } from "date-fns";

export default function ExamContainer() {
  const { examId } = useParams();
  const session = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examStatus, setExamStatus] = useState(null);
  const [examState, setExamState] = useState("notStarted");
  const [serverTime, setServerTime] = useState(new Date());
  useEffect(() => {
    if (
      isEqual(serverTime, examStatus?.startTime) ||
      serverTime > examStatus?.startTime
    ) {
      setExamState("started");
    }

    if (
      isEqual(serverTime, examStatus?.endTime) ||
      serverTime > examStatus?.endTime
    ) {
      setExamState("ended");
    }

    if (serverTime < examStatus?.startTime) {
      setExamState("notStarted");
    }
  }, [serverTime]);

  useEffect(() => {
    const fetchExamStatus = async () => {
      if (!examId || !session?.user?.id) return;
      try {
        setLoading(true);
        const status = await getExamStatus(examId, session?.user?.id);
        const endTimeAdded = {
          ...status,
          endTime:
            new Date(status.startTime).getTime() + status.duration * 60 * 1000,
        };
        setExamStatus(endTimeAdded);
      } catch (err) {
        console.error("Error fetching exam data:", err);
        setError("Failed to load exam data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamStatus();
    const socket = io(import.meta.env.VITE_SERVER_URL);
    socket.on("exam-id", (cb) => {
      cb(examId);
    });

    socket.on("time-update", (data) => {
      // console.log(format(data.time, "PPpp"));
      setServerTime(data.time);
    });
  }, [examId, session?.user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100vh]">
        fetching exam details....
      </div>
    );
  }

  return (
    <ExamUI
      examState={examState}
      session={session}
      examStatus={examStatus}
      serverTime={serverTime}
      examId={examId}
    />
  );
}
