import React from "react";
import styles from "../styles/ProgressBar.module.css";

interface ProgressBarProps {
    percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
    return (
        <div className={styles.progressBarContainer}>
            <div
                className={styles.progressBar}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;
