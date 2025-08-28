import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SelectList from "../components/SelectList";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "../context/SessionContext";
import { generateQuestions } from "../api";
import { useNavigate } from "react-router";

export default function QuizGenerationDialog({
  children,
  title,
  description,
  context,
}) {
  const navigate = useNavigate();
  const [generationSettings, setGenerationSettings] = useState({
    questionType: "multiple-choice",
    questionCount: 20,
    instruction: "",
  });
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const changeQuestionType = (value) => {
    setGenerationSettings({
      ...generationSettings,
      questionType: value,
    });
  };

  const changeQuestionCount = (value) => {
    setGenerationSettings({
      ...generationSettings,
      questionCount: value,
    });
  };

  const changeInstruction = (e) => {
    setGenerationSettings({
      ...generationSettings,
      instruction: e.target.value,
    });
  };

  const handleGenerate = async () => {
    console.log("hello ", context);
    if (!context.trim()) {
      // TODO: Show toast
      return;
    }

    if (context.trim().length > 10) {
      setIsLoading(true);
      try {
        if (session.isAuthenticated) {
          const response = await generateQuestions(session.user.id, {
            quantity: generationSettings.questionCount,
            knowledge: context,
            instructions: generationSettings.instruction,
            type: generationSettings.questionType,
          });
          console.log("response ", response);
          // Navigate to the quiz with the quizsetId
          if (response.quizsetId) {
            navigate(`/q/${response.quizsetId}`);
          }
        } else {
          // TODO: Show toast and navigate to login
          alert("Please login to generate quizzes");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error generating quiz:", error);
        alert("Error generating quiz. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className={`font-inter font-[500] text-lg`}>
        <DialogHeader>
          <DialogTitle className={`text-3xl`}>{title}</DialogTitle>
          <DialogDescription className={`text-lg`}>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-2">
          <SelectList
            value={generationSettings.questionType}
            onValueChange={(value) => changeQuestionType(value)}
            label="Question Type"
            itemsList={[{ value: "multiple-choice", label: "Multiple Choice" }]}
          />
          <SelectList
            value={generationSettings.questionCount}
            onValueChange={(value) => changeQuestionCount(value)}
            label="Choose how many questions to create"
            itemsList={Array.from({ length: 40 }, (_, i) => {
              if (i % 5 === 4 && i >= 9) {
                return {
                  value: i + 1,
                  label: i + 1,
                };
              }
            }).filter((item) => item !== undefined)}
          />
          <div className="flex flex-col gap-y-2">
            <Label>Instruction</Label>
            <Textarea
              value={generationSettings.instruction}
              onChange={(e) => changeInstruction(e)}
              className={"h-[150px]"}
              placeholder={
                "example : make 50% questions harder and 50% questions easier"
              }
            ></Textarea>
          </div>
        </div>
        <DialogFooter>
          <DialogClose>
            <Button asChild variant="secondary">
              <div>Cancel</div>
            </Button>{" "}
          </DialogClose>
          <DialogClose>
            <Button asChild>
              <div onClick={handleGenerate}>Generate</div>
            </Button>{" "}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
