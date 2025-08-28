import { useState } from "react";
import { Button } from "@/components/ui/button";
import SelectList from "@/src/components/SelectList";
import { useSession } from "../context/SessionContext";
import { generateQuestions } from "../api";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { Blend } from "lucide-react";
import { Send } from "lucide-react";
import { AuthButtons } from "./Auth";
import QuizGenerationDialog from "./QuizGenerationDialog";

function QuizGenerationFront() {
  const session = useSession();
  const userDetails = session?.user?.user_metadata;
  const [context, setContext] = useState("");
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-3xl mx-auto p-4">
      {session.isAuthenticated && (
        <div className="text-black font-mynerve text-3xl font-bold mb-2">
          Hey, {userDetails?.full_name}!{" "}
        </div>
      )}
      {!session.isAuthenticated && (
        <div className="flex flex-col items-center my-5">
          <div className="text-black font-mynerve text-3xl font-bold mb-2">
            Hey, let's take a moment to sign in.
          </div>
          <AuthButtons session={session} />
        </div>
      )}
      <div className="relative mt-5">
        <QuizGenerationDialog context={context}>
          <Button
            asChild
            variant="primary"
            className="absolute bottom-5 right-5"
          >
            <div>
              <Send />
            </div>
          </Button>
        </QuizGenerationDialog>
        <textarea
          onChange={(e) => setContext(e.target.value)}
          placeholder="Give me any context you want to test yourself or others."
          className="w-[800px] p-5 h-[100px] focus:h-[400px] shadow-md  rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary  focus:border-primary transition-all duration-200 text-gray-700 placeholder-primary bg-primary/20 shadow-sm p-4 focus:text-black "
        ></textarea>
      </div>
    </div>
  );
}

export default QuizGenerationFront;
