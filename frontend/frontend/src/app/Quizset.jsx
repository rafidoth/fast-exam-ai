import { useState } from "react";
import { fetchQuizset, generateQuestions, updateQuizsetTitle } from "../api";
import { ChevronRight } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import QuizCard from "./QuizCard";
import { Button } from "@/components/ui/button";
import { useSession } from "../context/SessionContext";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import EditableTitle from "../components/EditableTitle";
import { toast } from "sonner";
import { useRef } from "react";
import { useSearchParams } from "react-router";
import QuizsetTopBar from "./QuizsetTopbar";
import useQuizsetStore, {
  arrangeQuizzesAccordingToPositions,
} from "../store/quizsetStore";
import {
  closestCenter,
  DndContext,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDebugValue } from "react";

function Quizset() {
  const quizsetId = useParams().quizsetId;
  const [searchParams] = useSearchParams();
  const contextFieldOpen = searchParams.get("context");

  const quizzes = useQuizsetStore((state) => state.quizzes);
  const updateQuizzes = useQuizsetStore((state) => state.setQuizzes);

  const quizsetTitle = useQuizsetStore((state) => state.title);
  const setQuizsetTitle = useQuizsetStore((state) => state.setTitle);

  const isSavingTitle = useQuizsetStore((state) => state.loading.savingTitle);
  const setIsSavingTitle = useQuizsetStore((state) => state.setSavingTitle);

  const context = useQuizsetStore((state) => state.context);
  const changeContext = useQuizsetStore((state) => state.setContext);

  const isGenerating = useQuizsetStore(
    (state) => state.loading.generatingQuizzes
  );
  const setIsGenerating = useQuizsetStore(
    (state) => state.setGeneratingQuizzes
  );

  const answeredQuizzes = useQuizsetStore((state) => state.answeredQuizzes);
  const setAnsweredQuizzes = useQuizsetStore((state) => state.selectAnswer);

  const editMode = useQuizsetStore((state) => state.editMode);
  const toggleEditMode = useQuizsetStore((state) => state.toggleEditMode);
  const cancelEditMode = useQuizsetStore((state) => state.cancelEditMode);

  const session = useSession();
  const navigate = useNavigate();
  const quizContainerRef = useRef(null);
  const [columns, setColumns] = useState(1);

  const handleTitleUpdate = async (newTitle) => {
    if (newTitle.trim() === quizsetTitle) return;
    setQuizsetTitle(newTitle);
    setIsSavingTitle(true);
    try {
      if (session?.user?.id) {
        await updateQuizsetTitle(quizsetId, newTitle, session.user.id);
        const key = `quizset-${quizsetId}`;
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.quizsetTitle = newTitle;
          localStorage.setItem(key, JSON.stringify(parsed));
        }

        toast.success("Title updated successfully");
      }
    } catch (error) {
      console.error("Failed to update title:", error);
      toast.error("Failed to update title");
    } finally {
      setIsSavingTitle(false);
    }
  };

  const selectAnswer = (questionNo, choiceMade) => {
    setAnsweredQuizzes((prev) => {
      const newAnsweredQuizzes = [...prev];
      newAnsweredQuizzes[questionNo] = choiceMade;
      return newAnsweredQuizzes;
    });
  };

  const toggleContextField = () => {
    if (contextFieldOpen) {
      navigate(`/q/${quizsetId}`);
    } else {
      navigate(`/q/${quizsetId}?context=true`);
    }
  };

  useEffect(() => {
    const container = quizContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      setColumns(neededColumns(quizContainerRef, 300, 16));
    });

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (quizsetId) {
      const key = `quizset-${quizsetId}`;
      const cached = localStorage.getItem(key);

      const fetchQuizzes = async () => {
        try {
          const response = await fetchQuizset(quizsetId, session.user.id);
          // updateQuizzes(response.quizzes);
          changeContext(response.context);
          setQuizsetTitle(response.quizsetTitle);
          localStorage.setItem(key, JSON.stringify(response));
        } catch (error) {
          console.error(error);
          navigate("/not-found");
        }
      };
      if (cached) {
        const parsed = JSON.parse(cached);
        updateQuizzes(parsed.quizzes);
        changeContext(parsed.context);
        setQuizsetTitle(parsed.quizsetTitle);
      } else {
        fetchQuizzes();
      }
    }
  }, [quizsetId]);

  return (
    <div className="h-full w-full flex  space-y-6 ">
      {/* Quizset Questions */}
      <div
        className={`${
          contextFieldOpen ? "w-1/2" : "w-full"
        } h-full transition-all duration-500 p-6`}
      >
        <div className="relative">
          <QuizsetTopBar
            quizsetId={quizsetId}
            quizsetTitle={quizsetTitle}
            isGenerating={isGenerating}
            context={context}
            editMode={{ editMode, toggleEditMode, cancelEditMode }}
            quizContainerRef={quizContainerRef}
          />

          <div
            className="max-h-[calc(100vh-70px)] overflow-y-auto p-5 flex justify-center gap-4"
            ref={quizContainerRef}
          >
            {editMode ? (
              <QuizsetBodyDragAndDropEditMode />
            ) : (
              <QuizsetBody columns={columns} />
            )}
          </div>
        </div>
      </div>
      {/* Quizset Context  */}
      <div
        className={`${
          contextFieldOpen ? "w-1/2" : "w-[40px]"
        } h-full border-l-1 border-l-black/10 relative transition-all duration-500`}
      >
        <span
          className="hover:bg-black transition-all duration-300 bg-primary/30  absolute -left-4 top-30 bg rounded-full"
          onClick={() => {
            toggleContextField();
          }}
        >
          {contextFieldOpen ? (
            <ChevronRight size={32} color="white" className="" />
          ) : (
            <ChevronLeft size={32} color="white" className="" />
          )}
        </span>
        <div
          className={`w-full h-full ${contextFieldOpen ? "" : "hidden"}
          `}
        >
          <div className="bg-accent py-2">
            <EditableTitle
              title={quizsetTitle}
              onSave={handleTitleUpdate}
              disabled={isSavingTitle}
              titleClassName="text-2xl"
              inputClassName="text-2xl"
            />
          </div>
          <ContextTextArea context={context} changeContext={changeContext} />
        </div>
      </div>
    </div>
  );
}

const QuizsetBody = ({ columns }) => {
  const quizzes = useQuizsetStore((state) => state.quizzes);
  const arrangedColumns = quizzesArrangedInColumns(quizzes, columns);
  return (
    <div className="flex gap-4">
      {arrangedColumns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-4">
          {column.map((quiz, i) => (
            <SortableItem
              key={quiz.position}
              quiz={quiz}
              index={i * columns + columnIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const QuizsetBodyDragAndDropEditMode = () => {
  const quizzes = useQuizsetStore((state) => state.quizzes);
  const updateQuizzes = useQuizsetStore((state) => state.setQuizzes);
  const editModeStateQuizzes = useQuizsetStore(
    (state) => state.editModeQuizzes
  );
  const setEditModeStateQuizzes = useQuizsetStore(
    (state) => state.setEditModeQuizzes
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || !active) return;
    if (active.id === over.id) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    const newQuizzes = [...editModeStateQuizzes];
    const activeIndex = newQuizzes.findIndex((q) => q.position === activeId);
    const overIndex = newQuizzes.findIndex((q) => q.position === overId);

    if (activeIndex < overIndex) {
      const temp = newQuizzes[activeIndex];
      for (let i = activeIndex; i < overIndex; i++) {
        newQuizzes[i] = newQuizzes[i + 1];
      }
      newQuizzes[overIndex] = temp;
    } else {
      const temp = newQuizzes[activeIndex];
      for (let i = activeIndex; i > overIndex; i--) {
        newQuizzes[i] = newQuizzes[i - 1];
      }
      newQuizzes[overIndex] = temp;
    }
    setEditModeStateQuizzes(newQuizzes);
  };
  useEffect(() => {
    setEditModeStateQuizzes(quizzes);
  }, []);
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={quizzes.map((quiz) => String(quiz.position))}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex flex-wrap gap-4 justify-center items-center">
          {editModeStateQuizzes.map((quiz, index) => (
            <SortableItem key={quiz.position} quiz={quiz} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

const SortableItem = ({ quiz, index }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(quiz.position) });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
      ${isDragging ? "bg-white/20 backdrop-blur-sm" : ""}
    `}
    >
      <QuizCard quiz={quiz} index={index} />
    </div>
  );
};

const quizzesArrangedInColumns = (quizzes, columns) => {
  const columnQuizzes = Array.from({ length: columns }, () => []);
  quizzes.forEach((quiz, index) => {
    columnQuizzes[index % columns].push(quiz);
  });
  return columnQuizzes;
};

const neededColumns = (containerRef, cardWidth, gap) => {
  if (!containerRef.current) return 0;
  console.log(containerRef.current.clientWidth);
  const columnsCount = Math.floor(
    containerRef.current.clientWidth / (cardWidth + gap)
  );
  return columnsCount;
};

const ContextTextArea = ({ context, changeContext }) => {
  return (
    <textarea
      value={context}
      onChange={(e) => changeContext(e.target.value)}
      placeholder="Enter your text context here..."
      className={`w-full h-full p-4 border-0 rounded-xl outline-0`}
    />
  );
};

export default Quizset;
