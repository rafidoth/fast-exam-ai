import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";

export default function EditableTitle({
  title,
  onSave,
  className = "",
  titleClassName = "text-3xl font-semibold",
  inputClassName = "text-3xl font-semibold",
  disabled = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const inputRef = useRef(null);

  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (editedTitle.trim() !== "") {
      onSave(editedTitle);
    } else {
      setEditedTitle(title); // Reset to original if empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {isEditing ? (
        <div className="w-full flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={`w-full border-none outline-none focus:outline-primary/50 focus:ring-0 ${inputClassName}`}
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="p-1"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleEdit}
          variant="ghost"
          className={`p-4 rounded-sm bg-neutral-2300 ${titleClassName}`}
        >
          {title}
        </Button>
      )}
    </div>
  );
}
