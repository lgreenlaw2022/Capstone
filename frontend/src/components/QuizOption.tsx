import React from 'react';
import styles from '../styles/QuizOption.module.css';

interface QuizOptionProps {
    // TODO: make option a type?
    option: {
        id: number;
        option_text: string;
        is_correct: boolean;
    };
    selectedOption: number | null;
    handleOptionChange: (optionId: number) => void;
    submitted: boolean;
}

const QuizOption: React.FC<QuizOptionProps> = ({ option, selectedOption, handleOptionChange, submitted }) => {
    return (
        <div className={styles.option}>
            <label>
                <input
                    type="radio"
                    name={`option-${option.id}`}
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={() => handleOptionChange(option.id)}
                    disabled={submitted}
                />
                {option.option_text}
            </label>
            {/* TODO: transfer this styling up  */}
            {submitted && option.is_correct && <span className={styles.correct}> (Correct)</span>}
            {submitted && selectedOption === option.id && !option.is_correct && <span className={styles.incorrect}> (Incorrect)</span>}
        </div>
    );
};

export default QuizOption;