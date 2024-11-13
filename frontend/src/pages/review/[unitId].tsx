import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Quiz from '@/components/Quiz';
import styles from '../../styles/Quiz.module.css';

const UnitQuizPage = () => {
    const router = useRouter();
    const { unitId } = router.query;
    const [questions, setQuestions] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');

    const fetchQuestions = async () => {
        try {
            const data = await getWeeklyReviewQuestions();
            setQuestions(data);
            const title = await getUnitQuizTitle(unitId);
            setQuizTitle(title);

        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [unitId]);

    const handleSubmit = async (numCorrectAnswers: number) => {
        // TODO: call endpoint
        console.log('Quiz submitted with score:');
    }

    return (
        <div className={styles.quizContainer}>
            <Quiz
                questions={questions}
                moduleTitle={quizTitle}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default UnitQuizPage;