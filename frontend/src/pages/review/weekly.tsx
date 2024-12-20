import Quiz from "@/components/Quiz";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getWeeklyReviewQuestions, submitWeeklyReviewScore } from "@/api/api";
import { QuizQuestion } from "@/types/QuestionTypes";
import styles from "../../styles/Quiz.module.css";

export default function WeeklyReviewQuizPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);

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
        const accuracy = (numCorrectAnswers / questions.length) * 100;
        await submitWeeklyReviewScore(accuracy);
        router.push("/review");
    };

    return (
        <>
            {questions.length !== 0 ? (
                <Quiz
                    questions={questions}
                    moduleTitle="Weekly Review"
                    onSubmit={handleSubmit}
                />
            ) : (
                <div className={styles.noQuestionsContainer}>
                    <p>No questions to review. Please complete more modules.</p>
                    <button
                        type="button"
                        onClick={() => router.push("/review")}
                    >
                        Back to Review Page
                    </button>
                </div>
            )}
        </>
    );
}
