import React, { useState, useEffect } from 'react';
import QuizOption from "./QuizOption";
import styles from '../styles/QuizQuestion.module.css';

// TODO: make quiz question a type
interface QuizQuestionProps {
    question: {
        id: number;
        title: string;
        options: {
            id: number;
            option_text: string;
            is_correct: boolean;
        }[];
    };
    handleNextQuestion: (isCorrect: boolean) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, handleNextQuestion }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Reset state when the question prop changes
        setSelectedOption(null);
        setSubmitted(false);
    }, [question]);

    const handleOptionChange = (optionId: number) => {
        setSelectedOption(optionId);
    };

    const handleSubmit = () => {
        // TODO: make sure I can employ the conditional styling
        setSubmitted(true);
    };

    const handleNext = () => {
        const selected = question.options.find(option => option.id === selectedOption);
        handleNextQuestion(selected?.is_correct || false);
    }

    return (
        <div className={styles.quizQuestionContainer}>
            <h2>{question.title}</h2>
            <div className={styles.optionsContainer}>
                {/* TODO: shuffle order of questions */}
                {question.options.map(option => (
                    <QuizOption
                        key={option.id}
                        option={option}
                        selectedOption={selectedOption}
                        handleOptionChange={handleOptionChange}
                        submitted={submitted}
                    />
                ))}
            </div>
            {!submitted ? (
                <button onClick={handleSubmit} disabled={selectedOption === null}>
                    Submit
                </button>
            ) : (
                <button onClick={handleNext}>
                    Continue
                </button>
            )}
        </div>
    );
};

export default QuizQuestion;