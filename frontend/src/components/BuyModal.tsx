import React from 'react';
import styles from '../styles/BuyModal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}

const BuyModal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose}></div>
            <div className={styles.modal}>
                <h4>{title}</h4>
                <div>{children}</div>
                <div className={styles.buttonGroup}>
                    <button type="button" onClick={onConfirm}>Confirm</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </>
    );
};

export default BuyModal;