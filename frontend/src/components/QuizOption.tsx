import React from "react";
import styles from "../styles/QuizOption.module.css";
import classNames from "classnames";

interface QuizOptionProps {
    option: {
        id: number;
        option_text: string;
        is_correct: boolean;
    };
    selectedOption: number | null;
    handleOptionChange: (optionId: number) => void;
    submitted: boolean;
}

const QuizOption: React.FC<QuizOptionProps> = ({
    option,
    selectedOption,
    handleOptionChange,
    submitted,
}) => {
    // Determine the class name based on the submission status, correctness, and selected state
    const optionClassName = classNames(styles.option, {
        [styles.correct]: submitted && option.is_correct,
        [styles.incorrect]:
            submitted && selectedOption === option.id && !option.is_correct,
        [styles.selected]: !submitted && selectedOption === option.id,
    });

    const handleClick = () => {
        // disable option selection if the question has been submitted
        if (!submitted) {
            handleOptionChange(option.id);
        }
    };

    return (
        <div className={optionClassName} onClick={handleClick}>
            <label htmlFor={`option-${option.id}`}>
                <input
                    type="radio"
                    id={`option-${option.id}`}
                    name={`option-${option.id}`}
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={() => handleOptionChange(option.id)}
                    disabled={submitted}
                    className={styles.hiddenRadio}
                />
                {option.option_text}
            </label>
        </div>
    );
};

export default QuizOption;
