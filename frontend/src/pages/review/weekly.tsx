import Quiz from "@/components/Quiz";
import { useEffect, useState } from "react";


const WeeklyReviewQuizPage = () => {
    const [questions, setQuestions] = useState([]);
    const [quizTitle, setQuizTitle] = useState('Weekly Review');

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
        console.log('Quiz submitted with score:');
    }

    return (
        <Quiz
            questions={questions}
            moduleTitle={quizTitle}
            onSubmit={handleSubmit}
        />
    );
};
