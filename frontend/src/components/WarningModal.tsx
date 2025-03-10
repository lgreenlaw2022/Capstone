import React from "react";
import styles from "@/styles/WarningModal.module.css";

interface WarningModalProps {
    show: boolean;
    onClose: () => void;
    onContinue: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({
    show,
    onClose,
    onContinue,
}) => {
    if (!show) {
        return null;
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <p>
                    Your solution has not passed all code checks. Are you sure
                    you want to skip to the solution?
                </p>
                <div className={styles.buttonContainer}>
                    <button type="button" onClick={onContinue}>
                        Yes
                    </button>
                    <button type="button" onClick={onClose}>
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarningModal;
