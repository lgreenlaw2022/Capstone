import { useEffect, useState } from "react";
import Image from "next/image";
import gem from "../../public/assets/gem.svg";

import styles from "../styles/Hints.module.css";

interface Hint {
    hintId: number;
    hint: string;
    order: number;
    unlocked: boolean;
}

export default function Hints() {
    const [lockedHints, setLockedHints] = useState<Hint[]>([
        {
            hintId: 2,
            hint: "This is another hint",
            order: 2,
            unlocked: false,
        },
    ]);
    const [unlockedHints, setUnlockedHints] = useState<Hint[]>([
        {
            hintId: 1,
            hint: "This is a hint",
            order: 1,
            unlocked: true,
        },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchHints = async () => {
        try {
            // const data = await getHints();
            // order the hints by order
            // setLockedHints(data.filter((hint) => !hint.unlocked));
            // setUnlockedHints(data.filter((hint) => hint.unlocked));
        } catch (error) {
            console.error("Error fetching hints:", error);
        }
    };

    const handleBuy = () => {
        // Handle the buy action
        if (lockedHints.length > 0) {
            const hintToUnlock = lockedHints[0];
            // await buyHint(hintToUnlock.hintId);
            setLockedHints(lockedHints.slice(1));
            setUnlockedHints([...unlockedHints, hintToUnlock]);
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
        </div>
    );
}
