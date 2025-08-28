import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DateTimePicker from "../components/DateTimePicker";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { createNewExam, fetchExamsByQuizset } from "../api";
import { useSession } from "../context/SessionContext";
import { useNavigate } from "react-router";
import { format } from "date-fns";

const durationOptions = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1h", value: 60 },
];

export default function ExamCreationDialog({ quizsetId, quizsetTitle }) {
  const [examState, setExamState] = useState({
    creatorParticipationAllowed: false,
    startTime: new Date(),
    duration: 30,
  });
  const [existingExams, setExistingExams] = useState([]);
  const [loading, setLoading] = useState({
    fetchingPreviousExam: false,
    creatingNewExam: false,
  });
  const [error, setError] = useState(null);
  const session = useSession();
  const navigate = useNavigate();
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const fetchExams = async () => {
      if (quizsetId && session?.user?.id) {
        setLoading((p) => ({ ...p, fetchingPreviousExam: true }));
        try {
          const examData = await fetchExamsByQuizset(
            quizsetId,
            session.user.id
          );
          setExistingExams(examData);
        } catch (error) {
          console.error("Error fetching exams:", error);
        } finally {
          setLoading((p) => ({ ...p, fetchingPreviousExam: false }));
        }
      }
    };

    fetchExams();
  }, [quizsetId, session?.user?.id]);
  const examStateHandlers = {
    toggleCreatorParticipation: () => {
      setExamState({
        ...examState,
        creatorParticipationAllowed: !examState.creatorParticipationAllowed,
      });
    },
    changeStartTime: (date) => {
      setExamState({
        ...examState,
        startTime: date,
      });
    },
    changeDuration: (duration) => {
      setExamState({
        ...examState,
        duration: duration,
      });
    },
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button asChild variant={"outline"}>
          <div>Exam</div>
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`font-inter font-[500] text-lg min-w-fit px-10  border-none outline-none rounded-2xl`}
      >
        <DialogHeader>
          <DialogTitle className={`text-3xl`}>{quizsetTitle}</DialogTitle>
          <DialogDescription className={`text-lg`}>
            {"Create an exam from this quizset or view existing exams"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-10 ">
          {/* Existing Exams Section */}
          {existingExams.length > 0 && (
            <div className="flex flex-col gap-y-2 items-start">
              <span className="text-xl font-[600]">Existing Exams</span>
              <div className="flex flex-col gap-y-2">
                {existingExams.map(
                  (exam, i) =>
                    i < 2 && <ExistingExamUI exam={exam} key={exam.id} />
                )}
                {existingExams.length > 2 && (
                  <Button
                    variant="outline"
                    className="w-full h-fit text-left flex justify-center items-center  hover:bg-accent cursor-pointer"
                    onClick={() => navigate(`/xm/${quizsetId}`)}
                  >
                    See All Exams
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* fetching previous exams loading */}
          {loading.fetchingPreviousExam && (
            <div className="text-center py-2">Loading exams...</div>
          )}

          <div className="flex flex-col gap-y-2 items-start">
            <span className="text-xl font-[600]">Preferences</span>
            <TwoRowCheckboxButton
              onClick={examStateHandlers.toggleCreatorParticipation}
              checkboxStatus={examState.creatorParticipationAllowed}
              description={
                "If checked, you'll take the exam like other participants. If unchecked, you'll be able to monitor the exam live instead."
              }
              label="Join as a Participant"
            />
          </div>
          <div className="flex flex-col gap-y-2 items-start">
            <span className="text-xl font-[600]">Schedule Your Exam</span>
            <div className="flex flex-col">
              <DateTimePicker
                examState={examState}
                examStateHandlers={examStateHandlers}
              />
              <span className="text-sm my-2 font-[500]">Duration</span>
              <div className="flex mb-2 gap-x-2 flex-wrap">
                {durationOptions.map((option, i) => (
                  <Button
                    variant={"outline"}
                    key={option.value}
                    onClick={() => {
                      examStateHandlers.changeDuration(option.value);
                      setDuration(i);
                    }}
                    className={`${
                      i === duration
                        ? "text-white bg-primary hover:bg-primary hover:text-white border-none rounded-xl"
                        : ""
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose>
            <Button asChild variant="secondary">
              <div>Cancel</div>
            </Button>{" "}
          </DialogClose>
          <Button asChild variant={"default"}>
            {!loading.creatingNewExam ? (
              <div
                className="cursor-pointer"
                onClick={async () => {
                  try {
                    setLoading((p) => ({ ...p, creatingNewExam: true }));
                    const result = await createNewExam({
                      title: quizsetTitle,
                      creatorId: session.user.id,
                      creatorParticipationAllowed:
                        examState.creatorParticipationAllowed,
                      startTime: examState.startTime,
                      duration: examState.duration,
                      quizSetId: quizsetId,
                      isPublic: true,
                      shuffleQuestions: true,
                    });

                    if (result?.success) {
                      console.log(result);
                      // Navigate to the newly created exam
                      if (result?.exam?.data?.id) {
                        navigate(`/x/${result?.exam?.data?.id}`);
                      } else {
                        console.log("not fdas");
                      }
                    } else {
                      throw new Error("Failed to create exam");
                    }
                  } catch (error) {
                    setError(error);
                  } finally {
                    setLoading((p) => ({ ...p, creatingNewExam: false }));
                  }
                }}
              >
                Create
              </div>
            ) : (
              <div className="text-muted-foreground">Creating...</div>
            )}
          </Button>{" "}
          {error && <p className="text-red-500">{error}</p>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExistingExamUI({ exam }) {
  const navigate = useNavigate();
  return (
    <Button
      key={exam.id}
      variant="outline"
      className="w-full h-fit text-left flex justify-between items-center   cursor-pointer"
      onClick={() => navigate(`/x/${exam.id}`)}
    >
      <div className="flex flex-col ">
        <span className="font-medium">{exam.title}</span>
        <Separator className="my-2 bg-primary/30" />
        <span className="text-sm text-primary">
          {format(exam.start_time, "PPp")} · {exam.duration_minutes} min
        </span>
      </div>
    </Button>
  );
}

function TwoRowCheckboxButton({ onClick, checkboxStatus, label, description }) {
  return (
    <div
      className="flex flex-col border-none  rounded-2xl p-4 hover:bg-primary/20 cursor-default bg-primary/10"
      onClick={() => {
        onClick();
      }}
    >
      <div className="flex items-center gap-x-2 ">
        <Checkbox checked={checkboxStatus} />
        <Label className="text-xl font-[600]">{label}</Label>
      </div>

      <Separator className={"my-2 bg-primary/30"} />
      <span className="w-[400px] font-[400] text-sm text-primary">
        {description}
      </span>
    </div>
  );
}
