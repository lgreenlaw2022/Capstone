import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { QuizQuestion as QuizQuestionType } from "@/types/QuestionTypes";
import { getModuleTitle, getQuizQuestions, submitQuizScore } from "@/api/api";
import Quiz from "@/components/Quiz";
import Loading from "@/components/Loading";

const QuizPage = () => {
    const router = useRouter();
    const { moduleId } = router.query;
    const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
    const [moduleTitle, setModuleTitle] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

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
            setLoading(true);
            Promise.all([fetchQuestions(), fetchModuleDetails()]).finally(
                () => {
                    setLoading(false); // Set loading to false after data is fetched
                }
            );
        }
    }, [moduleId]);

    const handleContinue = async (numCorrectAnswers: number) => {
        const accuracy = (numCorrectAnswers / questions.length) * 100;
        try {
            setLoading(true); // Set loading to true while submitting
            await submitQuizScore(Number(moduleId), accuracy);
            router.push("/learn");
        } catch (error) {
            console.error("Error submitting quiz score:", error);
        }
        finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <Quiz
            questions={questions}
            moduleTitle={moduleTitle}
            onSubmit={handleContinue}
        />
    );
};

export default QuizPage;
