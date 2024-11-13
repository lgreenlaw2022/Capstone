import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import QuizQuestion from "@/components/QuizQuestion";
import { getModuleTitle, getQuizQuestions, submitQuizScore } from "@/api/api";
import Quiz from "@/components/Quiz";

interface QuizQuestion {
    id: number;
    title: string;
    options: {
        id: number;
        option_text: string;
        is_correct: boolean;
    }[];
}

const QuizPage = () => {
    const router = useRouter();
    const { moduleId } = router.query;
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [moduleTitle, setModuleTitle] = useState<string>("");

    const fetchQuestions = async () => {
        try {
            const data = await getQuizQuestions(Number(moduleId));
            setQuestions(data);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    const fetchModuleDetails = async () => {
        try {
            const moduleDetails = await getModuleTitle(Number(moduleId));
            setModuleTitle(moduleDetails.title);
        } catch (error) {
            console.error("Error fetching module details:", error);
        }
    };

    useEffect(() => {
        if (moduleId) {
            // TODO: need a loading state
            fetchQuestions();
            fetchModuleDetails();
        }
    }, [moduleId]);

    const handleContinue = async (numCorrectAnswers: number) => {
        const accuracy = (numCorrectAnswers / questions.length) * 100;
        try {
            await submitQuizScore(Number(moduleId), accuracy);
            router.push("/learn");
        } catch (error) {
            console.error("Error submitting quiz score:", error);
        }
    };

    return (
        <Quiz
            questions={questions}
            moduleTitle={moduleTitle}
            onSubmit={handleContinue}
        />
    )
};

export default QuizPage;
