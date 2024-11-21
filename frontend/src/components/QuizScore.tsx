import React from "react";
import styles from "../styles/QuizScore.module.css";

interface QuizScoreProps {
    numCorrectAnswers: number;
    numQuestions: number;
    onContinue: () => void;
}

const QuizScore: React.FC<QuizScoreProps> = ({
    numCorrectAnswers,
    numQuestions,
    onContinue,
}) => {
    const XP_PER_QUIZ = 10;
    const ACCURACY_THRESHOLD = 80; // Threshold for passing

    // Calculate accuracy percentage
    const accuracy = Math.round((numCorrectAnswers / numQuestions) * 100);
    const passed = accuracy >= ACCURACY_THRESHOLD;

    // Determine feedback text
    const feedbackTitle = passed ? "Good work!" : "Not quite";
    const buttonText = passed ? "Keep it Going" : "Keep Learning";

    return (
        <div className={styles.quizScoreContainer}>
            <h1>{feedbackTitle}</h1>
            <div className={styles.scoreDescription}>
                <div>
                    <h1 className={styles.stat}>{accuracy}%</h1>
                    <p className={styles.text}>Accuracy</p>
                </div>
                {passed ? (
                    <div>
                        <h1 className={styles.stat}>{XP_PER_QUIZ}</h1>
                        <p>XP Earned</p>
                    </div>
                ) : (
                    <p className={styles.text}>
                        Review the material and try again
                    </p>
                )}
            </div>
            <button onClick={onContinue} className={styles.text}>
                {buttonText}
            </button>
        </div>
    );
};

export default QuizScore;
