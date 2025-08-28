import { create } from "zustand";

const useQuizsetStore = create((set) => ({
  title: "",
  quizzes: [],
  context: "",
  answeredQuizzes: [],
  loading: {
    savingTitle: false,
    generatingQuizzes: false,
  },
  editMode: false,
  editModeQuizzes: [],
  setEditModeQuizzes: (newQuizzesState) =>
    set({
      editModeQuizzes: newQuizzesState,
    }),
  deleteQuizInEditMode: (quizPosition) =>
    set((state) => ({
      editModeQuizzes: state.editModeQuizzes.filter(
        (quiz) => quiz.position !== quizPosition
      ),
    })),
  cancelEditMode: () =>
    set((state) => ({
      editMode: false,
    })),
  toggleEditMode: () =>
    set((state) => ({
      quizzes: state.editMode
        ? state.editModeQuizzes.map((quiz, i) => ({
            ...quiz,
            position: i + 1,
          }))
        : state.quizzes,
      answeredQuizzes: state.editMode ? [] : state.answeredQuizzes,
      editMode: !state.editMode,
    })),
  setQuizzes: (newQuizzes) =>
    set({
      quizzes: arrangeQuizzesAccordingToPositions(newQuizzes),
    }),
  setTitle: (newTitle) =>
    set({
      title: newTitle,
    }),
  setContext: (newContext) =>
    set({
      context: newContext,
    }),
  setSavingTitle: (isSaving) =>
    set((state) => ({
      loading: {
        ...state.loading,
        savingTitle: isSaving,
      },
    })),
  setGeneratingQuizzes: (isGenerating) =>
    set((state) => ({
      loading: {
        ...state.loading,
        generatingQuizzes: isGenerating,
      },
    })),

  selectAnswer: (questionPosition, choiceMade) =>
    set((state) => {
      const newAnsweredQuizzes = [...state.answeredQuizzes];
      newAnsweredQuizzes[questionPosition] = choiceMade;
      return { answeredQuizzes: newAnsweredQuizzes };
    }),
}));

export const arrangeQuizzesAccordingToPositions = (quizzes) => {
  const arrangedQuizzes = new Array(quizzes.length);
  quizzes.forEach((quiz) => {
    try {
      const pos = quiz.position - 1;
      if (pos < 0 || pos >= arrangedQuizzes.length) {
        console.warn(`Invalid position ${quiz.position} for quiz:`, quiz);
        return;
      }
      arrangedQuizzes[pos] = quiz;
    } catch (e) {
      console.error("Error arranging quizzes:", e);
    }
  });
  return arrangedQuizzes;
};

export default useQuizsetStore;
