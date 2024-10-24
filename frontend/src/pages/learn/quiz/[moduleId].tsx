import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import QuizQuestion from '@/components/QuizQuestion';
import ProgressBar from '@/components/ProgressBar';
import styles from '@/styles/Quiz.module.css';
import { getQuizQuestions } from '@/api/api';

interface QuizQuestion {
    id: number;
    title: string;
    options: {
        id: number;
        option_text: string;
        is_correct: boolean;
    }[];
}

const calculateProgressPercentage = (numQuestions: number, numCompleted: number) => {
    return (numCompleted / numQuestions) * 100;
}

const QuizPage = () => {
    const router = useRouter();
    const { moduleId } = router.query;
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // is the index reliable?
    const [numCorrectAnswers, setNumCorrectAnswers] = useState<number>(0);

    const currentQuestion = questions[currentQuestionIndex];
    const progressPercentage = calculateProgressPercentage(questions.length, currentQuestionIndex);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await getQuizQuestions(Number(moduleId));
                setQuestions(data);
                console.log('Questions:', data);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };

        if (moduleId) {
            fetchQuestions();
        }
    }, [moduleId]);

    // TODO: add feature to try missed questions again at the end of the quiz
    const handleNextQuestion = (isCorrect: boolean) => {
        if (isCorrect) {
            setNumCorrectAnswers(prev => prev + 1);
        }
        setCurrentQuestionIndex(prev => prev + 1);
    };

    // what's the trigger to recalculate percentage?
    // calculate progress helper

    // should question submission be handled by the page or the question component?
        // going to need to show the explanation and correct/incorrect post submit, which are based on the question
    return (
        <div>
            {currentQuestion ? (
                <div className={styles.quizContainer}>
                    {/* Unit title */}
                    <h1>Static Title</h1>
                    {/* Progress bar */}
                
                    {/* display the correct quiz question */}
                    <ProgressBar percentage={progressPercentage} />
                    <QuizQuestion question={currentQuestion} handleNextQuestion={handleNextQuestion} />
                </div>
            ) : (
                // TODO: this will be another component
                <div className={styles.quizCompletion}>
                    <h2>Quiz Completed!</h2>
                    <p>You got {numCorrectAnswers} out of {questions.length} questions correct.</p>
                </div>
            )}
        </div>
    );
};

export default QuizPage;