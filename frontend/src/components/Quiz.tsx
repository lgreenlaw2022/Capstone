import { useState } from "react";

import QuizQuestion from "@/components/QuizQuestion";
import ProgressBar from "@/components/ProgressBar";
import styles from "@/styles/Quiz.module.css";
import QuizScore from "@/components/QuizScore";
import { QuizQuestion as QuizQuestionType} from "@/types/QuestionTypes";

interface QuizProps {
    questions: QuizQuestionType[];
    moduleTitle: string;
    onSubmit: (score: number) => void;
}

const calculateProgressPercentage = (
    numQuestions: number,
    numCompleted: number
) => {
    return numQuestions > 0 ? (numCompleted / numQuestions) * 100 : 0;
};

const Quiz = ({ questions, moduleTitle, onSubmit }: QuizProps) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);  // TODO: is the index reliable?
    const [numCorrectAnswers, setNumCorrectAnswers] = useState<number>(0);

    const currentQuestion = questions[currentQuestionIndex];
    const progressPercentage = calculateProgressPercentage(
        questions.length,
        currentQuestionIndex
    );

    // TODO: add feature to try missed questions again at the end of the quiz
    const handleNextQuestion = (isCorrect: boolean) => {
        // log correct answers and move to next question
        if (isCorrect) {
            setNumCorrectAnswers((prev) => prev + 1);
        }
        setCurrentQuestionIndex((prev) => prev + 1);
    };

    return (
        <div>
            {currentQuestionIndex < questions.length ? (
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
                <div className={styles.quizContainer}>
                    <QuizScore
                        numCorrectAnswers={numCorrectAnswers}
                        numQuestions={questions.length}
                        onContinue={() => onSubmit(numCorrectAnswers)}
                    />
                </div>
            )}
        </div>
    );
};

export default Quiz;
