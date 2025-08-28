import { Button } from "@/components/ui/button";
import { format, formatDate } from "date-fns";
import Countdown from "./Countdown";
import { useSession } from "@/src/context/SessionContext";
import { UsersRound } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "lucide-react";
import { Timer } from "lucide-react";
import { Globe } from "lucide-react";
import { Lock } from "lucide-react";
import { Fragment } from "react";
import { joinExam } from "@/src/api";

function ExamUI({ examStatus, session, serverTime, examId }) {
  const participationStatus = examStatus?.status;
  let ExamComp = null;

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center h-[100vh] p-8">
        <div className="text-center">
          <p className="text-lg font-medium">
            Please login to access this exam.
          </p>
          <Button onClick={session.signInWithGoogle}>Login</Button>
        </div>
      </div>
    );
  }

  if (participationStatus === "notParticipant") {
    ExamComp = (
      <ExamNonParticipantUI
        examStatus={examStatus}
        serverTime={serverTime}
        examId={examId}
      />
    );
  }

  if (participationStatus === "participant") {
    ExamComp = (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <p className="text-lg font-medium">
            You are already registered for this exam.
          </p>
          <p>
            Exam will start at{" "}
            {format(examStatus?.startTime, "d MMMM, yyyy h.mm a")}
          </p>
        </div>
      </div>
    );
  }

  if (participationStatus === "creator") {
    ExamComp = (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <p className="text-lg font-medium">
            You are the creator of this exam.
          </p>
          <p>
            Exam will start at{" "}
            {format(examStatus?.startTime, "d MMMM, yyyy h.mm a")}
          </p>
          Remaining time :{" "}
          <Countdown
            startTime={examStatus?.startTime}
            serverTime={serverTime}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[100vh] p-8">
      {ExamComp}
    </div>
  );
}

function ExamParticipantUI({ examStatus }) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center">
        <p className="text-lg font-medium">
          You are already registered for this exam.
        </p>
        <p>
          Exam will start at{" "}
          {format(examStatus?.startTime, "d MMMM, yyyy h.mm a")}
        </p>
      </div>
    </div>
  );
}

function ExamNonParticipantUI({ examStatus, serverTime, examId }) {
  const session = useSession();
  const toolboxData = [
    {
      icon: <UsersRound />,
      text: examStatus?.participantsCount + " participants",
    },
    {
      icon: <Calendar />,
      text: formatDate(examStatus?.startTime, "d MMMM, yyyy h.mm a"),
    },
    { icon: <Timer />, text: examStatus?.duration + " minutes" },
    {
      icon: examStatus?.isPublic ? <Globe /> : <Lock />,
      text: examStatus?.isPublic ? "Public" : "Private",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-[100vh] p-8">
      <div className="font-mynerve text-3xl font-bold ">
        Hey,
        <span className="text-primary">
          {session?.user?.user_metadata?.full_name}!
        </span>
      </div>
      <div className="mb-5">You aren't a participant yet.</div>
      <Button
        variant={"ghost"}
        className="w-40 mb-5"
        onClick={() => joinExam(examId, session?.user?.id)}
      >
        Join Now
      </Button>

      <div className="font-bold text-4xl flex items-center justify-center">
        {examStatus?.title}
      </div>
      <ToolBox data={toolboxData} />

      <div className="absolute bottom-10 select-none">
        <Countdown startTime={examStatus?.startTime} serverTime={serverTime} />
      </div>
    </div>
  );
}

export default ExamUI;

function ToolBox({ data }) {
  return (
    <div className="flex h-[40px] items-center rounded-lg p-2 shadow-sm my-5 bg-primary/20 gap-x-2">
      {data.map((item, index) => (
        <Fragment key={index}>
          <ToolboxCell icon={item.icon} text={item.text} />
          {index !== data.length - 1 ? (
            <Separator orientation="vertical" className="mx-2 bg-black/10" />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

function ToolboxCell({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      {icon} {text}
    </div>
  );
}
