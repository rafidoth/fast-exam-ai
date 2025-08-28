import { useState } from "react";
import { Pencil, Trash2, Move } from "lucide-react";
import useQuizsetStore from "../store/quizsetStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have Textarea from ShadCN
import TextInputFieldUI from "./UI/TextInputFieldUI";
import AssuranceUI from "./UI/AsssuranceUI";

function resolveQuizCardChoiceStyle(
  userSelectedAnswer,
  originalAnswer,
  indexOfChoice
) {
  if (Number(userSelectedAnswer) === Number(indexOfChoice)) {
    if (Number(originalAnswer) === Number(indexOfChoice)) {
      return {
        btn: "bg-green-500 text-white shadow-sm",
        point: "bg-green-500 text-white",
      };
    } else {
      return {
        btn: "bg-red-500 text-white shadow-sm",
        point: "bg-red-500 text-white ",
      };
    }
  } else {
    return {
      btn: "hover:bg-primary/10 text-gray-900",
      point: "bg-primary/20 text-primary",
    };
  }
}

const QuizCard = ({ quiz, index }) => {
  const [hovered, setHovered] = useState(false);
  const editMode = useQuizsetStore((state) => state.editMode);
  const answeredQuizzes = useQuizsetStore((state) => state.answeredQuizzes);
  const selectAnswer = useQuizsetStore((state) => state.selectAnswer);

  return (
    <div
      key={index}
      className={`relative w-[300px] bg-primary/5 border border-primary/20 
        flex flex-col justify-between break-inside-avoid p-5 rounded-3xl 
        shadow-sm hover:shadow-md transition-all duration-300 ease-in-out
        ${editMode ? "cursor-pointer hover:scale-[1.02]" : ""}
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Edit overlay */}
      <QuizCardHovered hovered={hovered} quiz={quiz} />

      {/* Quiz Content */}
      <QuizContent quiz={quiz} index={index} />
    </div>
  );
};

const QuizContent = ({ quiz, index }) => {
  const editMode = useQuizsetStore((state) => state.editMode);
  const answeredQuizzes = useQuizsetStore((state) => state.answeredQuizzes);
  const selectAnswer = useQuizsetStore((state) => state.selectAnswer);

  return (
    <div>
      <span
        className="inline-block font-semibold text-primary bg-primary/20 
            px-3 py-1 rounded-md select-none"
      >
        Question {quiz.position}
      </span>
      <div className="my-4 font-semibold text-gray-900">{quiz.question}</div>

      <div className="flex flex-col gap-3">
        {quiz.choices.map((choice, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer 
                font-medium transition-all duration-200
                ${
                  !editMode &&
                  resolveQuizCardChoiceStyle(
                    answeredQuizzes[quiz.position],
                    quiz.answer,
                    i
                  ).btn
                }
              `}
            onClick={() => !editMode && selectAnswer(quiz.position, i)}
          >
            <div
              className={`w-7 h-7 min-w-[1.75rem] min-h-[1.75rem] flex items-center justify-center font-bold rounded-lg 
                  ${
                    !editMode &&
                    resolveQuizCardChoiceStyle(
                      answeredQuizzes[quiz.position],
                      quiz.answer,
                      i
                    ).point
                  }`}
            >
              {["A", "B", "C", "D"][i]}
            </div>
            {choice}
          </div>
        ))}
      </div>
    </div>
  );
};

const QuizCardHovered = ({ hovered, quiz }) => {
  const editMode = useQuizsetStore((state) => state.editMode);
  const deleteQuizInEditMode = useQuizsetStore(
    (state) => state.deleteQuizInEditMode
  );
  const [deleteSureDialog, setDeleteSureDialog] = useState(false);

  return (
    hovered &&
    editMode && (
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center
          rounded-xl bg-white/20 backdrop-blur-sm
          transition-all duration-300 ease-in-out scale-100`}
      >
        <div className="flex gap-4 px-6 py-4 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg">
          <EditMcqQuizDialog quiz={quiz}>
            <button className="hover:text-primary transition-colors">
              <Pencil size={22} />
            </button>
          </EditMcqQuizDialog>
          <AssuranceUI
            open={deleteSureDialog}
            onOpenChange={() => {
              setDeleteSureDialog((prev) => !prev);
            }}
            onCancel={() => setDeleteSureDialog(false)}
            confirmation={{
              text: "Delete",
              onConfirm: () => deleteQuizInEditMode(quiz.position),
            }}
            warningMessage="Are you sure you want to delete this quiz?"
          >
            <button className="hover:text-red-500 transition-colors">
              <Trash2 size={22} />
            </button>
          </AssuranceUI>
        </div>
      </div>
    )
  );
};

const EditMcqQuizDialog = ({ children, quiz }) => {
  const updateQuiz = useQuizsetStore((state) => state.updateQuiz); // Assuming updateQuiz action exists in your store; add it if not (e.g., to update the quiz by position)
  const [question, setQuestion] = useState(quiz.question);
  const [choices, setChoices] = useState([...quiz.choices]); // Assume 4 choices
  const [answer, setAnswer] = useState(quiz.answer.toString()); // Store as string for RadioGroup

  const handleChoiceChange = (index, value) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const handleSubmit = () => {
    const updatedQuiz = {
      ...quiz,
      question,
      choices,
      answer: parseInt(answer, 10),
    };
    updateQuiz(quiz.position, updatedQuiz); // Call store action to update
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className={"text-2xl font-bold"}>
            Quiz Question {quiz.position}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the question"
            />
          </div>
          {choices.map((choice, i) => (
            <div key={i} className="flex gap-2">
              <Label htmlFor={`choice-${i}`}>
                Choice {["A", "B", "C", "D"][i]}
              </Label>
              <Input
                id={`choice-${i}`}
                value={choice}
                onChange={(e) => handleChoiceChange(i, e.target.value)}
                placeholder={`Enter choice ${["A", "B", "C", "D"][i]}`}
                className={"flex-1"}
              />
            </div>
          ))}
          <div className="grid gap-2">
            <Label>Correct Answer</Label>
            <RadioGroup
              value={answer}
              onValueChange={setAnswer}
              className={"flex"}
            >
              {["0", "1", "2", "3"].map((val, i) => (
                <div key={val} className="flex items-center space-x-2">
                  <RadioGroupItem value={val} id={`answer-${val}`} />
                  <Label htmlFor={`answer-${val}`}>
                    {["A", "B", "C", "D"][i]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        <Button onClick={handleSubmit}>Save Changes</Button>
      </DialogContent>
    </Dialog>
  );
};

export default QuizCard;
