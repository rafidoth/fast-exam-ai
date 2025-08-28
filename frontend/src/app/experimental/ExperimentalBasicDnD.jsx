import {
  DndContext,
  pointerWithin,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { useState } from "react";

const Draggable = () => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "draggable-item",
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div
      className={`h-24 w-24 rounded-md bg-blue-500 p-4 text-white`}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
    >
      Drag me
    </div>
  );
};

const Droppable = ({ children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable-area",
  });
  return (
    <div
      ref={setNodeRef}
      className={`flex h-40 w-40 items-center justify-center rounded-md border-2 border-dashed border-gray-400 
        ${isOver ? "bg-green-100" : "bg-gray-50"} transition-colors duration-200
        `}
    >
      {children || "Drop here"}
    </div>
  );
};

const Experimental = () => {
  const [dropped, setDropped] = useState(false);
  const handleDragEnd = (event) => {
    if (event.over && event.over.id === "droppable-area") {
      setDropped(true);
      console.log("Drag ended", event);
    }
  };
  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
        {!dropped && <Draggable />}
        <Droppable>{dropped && <Draggable />}</Droppable>
      </div>
    </DndContext>
  );
};

const QuizCard = ({ quiz, index }) => {
  const { setNodeRef: dropRef } = useDroppable({
    id: `quiz-${quiz.position}`,
  });

  const { setNodeRef: dragRef } = useDraggable({
    id: `quiz-${quiz.position}`,
    data: { quiz, index },
  });

  return (
    <div
      className="w-[250px] border border-black/20 p-4 m-2 rounded-lg shadow-lg"
      ref={dropRef}
    >
      <div className="bg-white p-4 rounded-lg ">
        <h2 className="text-lg font-bold">Question {index + 1}</h2>
        <p className="mt-2">{quiz.question}</p>
      </div>
    </div>
  );
};

export default Experimental;
