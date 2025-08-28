import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useSession } from "../context/SessionContext";
import { fetchExamsByQuizset, fetchQuizset } from "../api";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Plus, ArrowRight, Clock, Users, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function ExamsOnQuizset() {
  const { quizsetId } = useParams();
  const session = useSession();
  const [exams, setExams] = useState([]);
  const [quizset, setQuizset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!quizsetId || !session?.user?.id) return;
      setLoading(true);
      try {
        // Fetch the quizset details
        const quizsetData = await fetchQuizset(quizsetId, session.user.id);
        setQuizset(quizsetData);

        // Fetch exams for this quizset
        const examData = await fetchExamsByQuizset(quizsetId, session.user.id);
        setExams(examData);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError("Failed to load exam data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizsetId, session?.user?.id]);

  // Helper function to determine exam status
  const getExamStatus = (startTime, duration) => {
    const now = new Date();
    // startTime is already a Date object, no need to create a new one
    const examStart = startTime;
    const examEnd = new Date(examStart.getTime() + duration * 60 * 1000); // duration is in minutes
    console.log("start", examStart);

    if (now < examStart) {
      return {
        status: "upcoming",
        label: "Upcoming",
        color: "bg-blue-100 text-blue-800",
      };
    } else if (now >= examStart && now <= examEnd) {
      return {
        status: "active",
        label: "Active",
        color: "bg-green-100 text-green-800",
      };
    } else {
      return {
        status: "ended",
        label: "Ended",
        color: "bg-gray-100 text-gray-800",
      };
    }
  };

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view exam details
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={session.signInWithGoogle}>Sign In</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-12 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-xl text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Exams for {quizset?.title || "Quizset"}
        </h1>
        <p className="text-gray-600 mb-4">
          {quizset?.questions?.length || 0} questions in this quizset
        </p>
        <div className="flex justify-between items-center">
          <Button asChild variant="outline" className="mb-4">
            <Link to={`/q/${quizsetId}`}>Back to Quizset</Link>
          </Button>
          <Button asChild className="mb-4">
            <Link to={`/q/${quizsetId}/create-exam`}>
              <Plus className="mr-2 h-4 w-4" /> Create New Exam
            </Link>
          </Button>
        </div>
      </div>

      {exams.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No exams found</h2>
          <p className="text-gray-600 mb-4">
            Create your first exam for this quizset
          </p>
          <Button asChild>
            <Link to={`/q/${quizsetId}/create-exam`}>
              <Plus className="mr-2 h-4 w-4" /> Create New Exam
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => {
            const examStatus = getExamStatus(
              exam.start_time,
              exam.duration_minutes
            );

            return (
              <Card
                key={exam.id}
                className="w-full hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    <Badge className={examStatus.color}>
                      {examStatus.label}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created by {exam.creatorName || "Anonymous"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Date: {format(exam.start_time, "PPP")}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        Time: {format(exam.start_time, "p")} -
                        {format(
                          new Date(
                            exam.start_time.getTime() +
                              exam.duration_minutes * 60 * 1000
                          ),
                          "p"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4" />
                      <span>{exam.participants?.length || 0} participants</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link to={`/x/${exam.id}`}>
                      View Exam <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ExamsOnQuizset;
