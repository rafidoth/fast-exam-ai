import ExamCreationDialog from "./ExamCreationDialog";
import QuizGenerationDialog from "./QuizGenerationDialog";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import AssuranceUI from "./UI/AsssuranceUI";
import { useState, useEffect, useRef } from "react";

const QuizsetTopBar = ({
  quizsetId,
  quizsetTitle,
  isGenerating,
  context,
  editMode,
  quizContainerRef,
}) => {
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true); // Track if at the top

  const toolbarClass = !isAtTop
    ? "absolute z-10 bg-white/40 backdrop-blur-md w-full h-16 border border-gray-200 shadow-lg flex items-center px-4 rounded-3xl"
    : "";
  useEffect(() => {
    const handleScroll = () => {
      if (quizContainerRef.current) {
        const isTop = quizContainerRef.current.scrollTop === 0;
        setIsAtTop(isTop);
      }
    };

    const container = quizContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className={toolbarClass}>
      <div className="flex items-center justify-between gap-2 w-full">
        <div className="flex items-center gap-2">
          <ExamCreationDialog
            quizsetId={quizsetId}
            quizsetTitle={quizsetTitle}
          />

          {isGenerating ? (
            <Button variant={"outline"} className={"cursor-not-allowed"}>
              <div>Generating...</div>
            </Button>
          ) : (
            <QuizGenerationDialog context={context}>
              <Button asChild variant={"outline"}>
                <div>Generate More</div>
              </Button>
            </QuizGenerationDialog>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!editMode.editMode && (
            <Button
              variant={"ghost"}
              className={`flex items-center gap-2 font-semibold hover:bg-none`}
              onClick={editMode.toggleEditMode}
            >
              Edit Mode <Edit2 />
            </Button>
          )}
          {editMode.editMode && (
            <div className="flex items-center ">
              <AssuranceUI
                open={discardDialogOpen}
                onOpenChange={() => setDiscardDialogOpen((prev) => !prev)}
                confirmation={{
                  text: "Discard",
                  onConfirm: () => {
                    editMode.toggleEditMode();
                    setDiscardDialogOpen(false);
                  },
                }}
                warningMessage="Are you sure you want to discard all changes?"
                onCancel={() => setDiscardDialogOpen(false)}
              >
                <Button
                  variant={"ghost"}
                  className={"text-red-700 rounded-3xl hover:bg-red-700/20"}
                >
                  Cancel
                </Button>
              </AssuranceUI>
              <Button
                variant={"ghost"}
                className={"text-primary rounded-3xl hover:bg-primary/20"}
                onClick={() => {
                  editMode.toggleEditMode();
                  console.log(
                    "here a difference should be shown before saving and after saving"
                  );
                  console.log("it should call save api");
                }}
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizsetTopBar;
