import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Quiz from "@/components/Quiz";
import styles from "../../styles/Quiz.module.css";

import { getUnitQuestions, getUnitTitle, submitUnitReviewScore } from "@/api/api";

const UnitQuizPage = () => {
    const router = useRouter();
    const { unitId } = router.query;
    const [questions, setQuestions] = useState([]);
    const [quizTitle, setQuizTitle] = useState("");

    const fetchQuestions = async () => {
        try {
            const data = await getUnitQuestions(Number(unitId));
            setQuestions(data);
            const unit_data = await getUnitTitle(Number(unitId));
            setQuizTitle(unit_data.title);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [unitId]);

    const handleSubmit = async (numCorrectAnswers: number) => {
        const accuracy = (numCorrectAnswers / questions.length) * 100;
        await submitUnitReviewScore(Number(unitId), accuracy);
        router.push("/review");
    };

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
