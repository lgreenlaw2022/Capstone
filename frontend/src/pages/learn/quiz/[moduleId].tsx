import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import QuizQuestion from "@/components/QuizQuestion";
import ProgressBar from "@/components/ProgressBar";
import styles from "@/styles/Quiz.module.css";
import { getModuleTitle, getQuizQuestions, submitQuizScore } from "@/api/api";
import QuizScore from "@/components/QuizScore";

interface QuizQuestion {
    id: number;
    title: string;
    options: {
        id: number;
        option_text: string;
        is_correct: boolean;
    }[];
}

const calculateProgressPercentage = (
    numQuestions: number,
    numCompleted: number
) => {
    return (numCompleted / numQuestions) * 100;
};

const QuizPage = () => {
    const router = useRouter();
    const { moduleId } = router.query;
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // is the index reliable?
    const [numCorrectAnswers, setNumCorrectAnswers] = useState<number>(0);
    const [moduleTitle, setModuleTitle] = useState<string | null>(null);

    const currentQuestion = questions[currentQuestionIndex];
    const progressPercentage = calculateProgressPercentage(
        questions.length,
        currentQuestionIndex
    );

    const fetchQuestions = async () => {
        try {
            const data = await getQuizQuestions(Number(moduleId));
            setQuestions(data);
            console.log("Questions:", data);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    const fetchModuleDetails = async () => {
        try {
            const moduleDetails = await getModuleTitle(Number(moduleId));
            setModuleTitle(moduleDetails.title);
            console.log("Module title:", moduleDetails);
        } catch (error) {
            console.error('Error fetching module details:', error);
        }
    };

    useEffect(() => {
        if (moduleId) {
            // TODO: need a loading state
            fetchQuestions();
            fetchModuleDetails();
        }
    }, [moduleId]);

    // TODO: add feature to try missed questions again at the end of the quiz
    const handleNextQuestion = (isCorrect: boolean) => {
        // log correct answers and move to next question
        if (isCorrect) {
            setNumCorrectAnswers((prev) => prev + 1);
        }
        setCurrentQuestionIndex((prev) => prev + 1);
    };

    const handleContinue = async () => {
        const accuracy = (numCorrectAnswers / questions.length) * 100;
        try {
            await submitQuizScore(Number(moduleId), accuracy);
            router.push("/learn");
        } catch (error) {
            console.error("Error submitting quiz score:", error);
        }
    };

    return (
        <div>
            {currentQuestion ? (
                <div className={styles.quizContainer}>
                    <h1>{moduleTitle}</h1>
                    <ProgressBar percentage={progressPercentage} />
                    <QuizQuestion
                        question={currentQuestion}
                        handleNextQuestion={handleNextQuestion}
                    />
                </div>
            ) : (
                // If no questions left, show the score
                // TODO: seems weird to apply the same styling because the class contains more than needed
                <div className={styles.quizContainer}>
                    <QuizScore
                        numCorrectAnswers={numCorrectAnswers}
                        numQuestions={questions.length}
                        onContinue={handleContinue}
                    />
                </div>
            )}
        </div>
    );
};

export default QuizPage;
