import { z } from "zod";



export const mcqSchema= z.object({
   position: z.number(),
   question: z.string(),
   choices: z.array(z.string()),
   answer: z.number(),
   answerExplanation: z.string(),
   difficulty: z.enum(["easy", "medium", "hard"]),
   type: z.enum(["mcq", "truefalse", "short", "fillintheblanks"]),
})
export const mcqArraySchema = z.array(mcqSchema);
