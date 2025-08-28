import { Button } from "@/components/ui/button";
import { useSession } from "../context/SessionContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function Auth() {
  const session = useSession();
  return (
    <>
      <div className="flex justify-center items-center h-[100vh] gap-x-2">
        <AuthCardUI session={session} />
      </div>
    </>
  );
}

export default Auth;

function AuthCardUI({ session }) {
  return (
    <Card className="w-[800px] py-[50px] bg-primary/5 border-none">
      <CardHeader
        className={
          "text-center text-4xl font-mynerve font-semibold text-primary"
        }
      >
        Hey, let's take a moment to sign in.
      </CardHeader>
      <CardContent className={"flex justify-center items-center"}>
        <AuthButtons session={session} />
      </CardContent>
    </Card>
  );
}

export function AuthButtons({ session }) {
  return (
    <div className="flex gap-x-6">
      <Button
        onClick={session.signInWithGoogle}
        variant={"primary"}
        className={"h-10 w-60"}
      >
        <img src="/google.png" className="w-7 h-7" alt="" />
        Continue with Google.
      </Button>
      <Button
        onClick={session.signInWithGoogle}
        variant={"primary"}
        className={"h-10 w-60"}
      >
        <img src="/apple.png" className="w-7 h-7" alt="" />
        Continue with Apple.
      </Button>
    </div>
  );
}
