import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Quiz from "@/components/Quiz";
import styles from "../../styles/Quiz.module.css";
import {
    getUnitQuestions,
    getUnitTitle,
    submitUnitReviewScore,
} from "@/api/api";
import Loading from "@/components/Loading";

const UnitQuizPage = () => {
    const router = useRouter();
    const { unitId } = router.query;
    const [questions, setQuestions] = useState([]);
    const [quizTitle, setQuizTitle] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchQuestions = async () => {
        try {
            const [questionsData, unitData] = await Promise.all([
                getUnitQuestions(Number(unitId)),
                getUnitTitle(Number(unitId)),
            ]);
            setQuestions(questionsData);
            setQuizTitle(unitData.title);
        } catch (error) {
            console.error("Error fetching questions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchQuestions();
    }, [unitId]);

    const handleSubmit = async (numCorrectAnswers: number) => {
        // calculate accuracy percent and submit the score
        const accuracy = (numCorrectAnswers / questions.length) * 100;
        await submitUnitReviewScore(Number(unitId), accuracy);
        router.push("/review");
    };

    if (loading) {
        return <Loading />;
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
