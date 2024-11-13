import Quiz from "@/components/Quiz";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const WeeklyReviewQuizPage = () => {
    const router = useRouter();
    const [questions, setQuestions] = useState([]);
    const [quizTitle, setQuizTitle] = useState("Weekly Review");

    const fetchQuestions = async () => {
        try {
            const data = await getWeeklyReviewQuestions();
            setQuestions(data);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleSubmit = async (numCorrectAnswers: number) => {
        // TODO: call endpoint
        console.log("Quiz submitted with score:");
        router.push("/review");
    };

    return (
        <Quiz
            questions={questions}
            moduleTitle={quizTitle}
            onSubmit={handleSubmit}
        />
    );
};
