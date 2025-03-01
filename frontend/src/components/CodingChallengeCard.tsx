import { useRouter } from "next/router";
import { useState } from "react";
import styles from "../styles/CodingChallengeCard.module.css";
import { buyBonusChallenge } from "@/api/api";
import BuyModal from "./BuyModal";

interface CodingChallengeCardProps {
    module_id: number;
    title: string;
    unit: string;
    open: boolean;
}

export default function ConceptReviewCard({
    module_id,
    title,
    unit,
    open,
}: CodingChallengeCardProps) {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const handleClick = async () => {
        if (open) {
            router.push(`/learn/challenge/${module_id}`);
        } else {
            setModalOpen(true);
        }
    };

    const handleConfirm = async () => {
        const result = await buyBonusChallenge(module_id);
        if (result.error) {
            setErrorMessage(result.error);
        } else {
            setErrorMessage(null);
            router.push(`/learn/challenge/${module_id}`);
        }
        setModalOpen(false);
    };

    return (
        <>
            <div>
                <div
                    className={styles.challengeCard}
                    onClick={handleClick}
                    role="button"
                >
                    <h4>{title}</h4>
                    <p>{unit}</p>
                </div>
                {errorMessage && <p className={styles.error}>{errorMessage}</p>}{" "}
            </div>
            <BuyModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                title="Buy Bonus Challenge"
            >
                <p>
                    Are you sure you want to buy this bonus challenge for 10
                    gems?
                </p>
            </BuyModal>
        </>
    );
}
