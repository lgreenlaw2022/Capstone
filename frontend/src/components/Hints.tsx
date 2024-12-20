import { useEffect, useState } from "react";
import Image from "next/image";
import gem from "../../public/assets/gem.svg";
import styles from "../styles/Hints.module.css";

import { getUserChallengeHints, buyHint } from "../api/api";

interface Hint {
    hintId: number;
    hint: string;
    order: number;
    unlocked: boolean;
}

export default function Hints({ moduleId }: { moduleId: number }) {
    const [lockedHints, setLockedHints] = useState<Hint[]>([]);
    const [unlockedHints, setUnlockedHints] = useState<Hint[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const fetchHints = async () => {
        try {
            const data = await getUserChallengeHints(moduleId);
            console.log("Hints:", data);
            // order the hints by order
            setLockedHints(data.filter((hint: Hint) => !hint.unlocked));
            setUnlockedHints(data.filter((hint: Hint) => hint.unlocked));
        } catch (error) {
            console.error("Error fetching hints:", error);
        }
    };

    const handleBuy = async () => {
        // Handle the buy action
        if (lockedHints.length > 0) {
            const hintToUnlock = lockedHints[0];
            const result = await buyHint(hintToUnlock.hintId);
            if (result.error) {
                setErrorMessage(result.error);
            } else {
                setLockedHints(lockedHints.slice(1));
                setUnlockedHints([...unlockedHints, hintToUnlock]);
                setErrorMessage(null);
            }
        }
        closeModal();
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        fetchHints();
    }, []);

    return (
        <div className={styles.hintsContainer}>
            <h3>Hints</h3>
            {unlockedHints.map((hint) => (
                <div key={hint.hintId} className={styles.hint}>
                    <p>{hint.hint}</p>
                </div>
            ))}
            {/* hide hints text button */}
            {lockedHints.length > 0 &&
                (isModalOpen ? (
                    <div className={styles.modal}>
                        <h4>Unlock Hint</h4>
                        <div className={styles.buttons}>
                            <button onClick={handleBuy}>
                                <Image
                                    src={gem}
                                    alt="gem"
                                    width={23}
                                    height={23}
                                />
                                5
                            </button>
                            <button onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={openModal}>Unlock Hint</button>
                ))}
            {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        </div>
    );
}
