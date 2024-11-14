import Quiz from "@/components/Quiz";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getWeeklyReviewQuestions, submitWeeklyReviewScore } from "@/api/api";

export default function WeeklyReviewQuizPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState([]);

    const fetchQuestions = async () => {
        try {
            const data = await getWeeklyReviewQuestions();
            setQuestions(data);
            console.log("Weekly review questions:", questions);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleSubmit = async (numCorrectAnswers: number) => {
        const accuracy = (numCorrectAnswers / questions.length) * 100;
        await submitWeeklyReviewScore(accuracy);
        router.push("/review");
    };

    return (
        <Quiz
            questions={questions}
            moduleTitle="Weekly Review"
            onSubmit={handleSubmit}
        />
    );
};
