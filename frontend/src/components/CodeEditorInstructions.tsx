import React, { useState } from "react";
import Image from "next/image";

import LeetCodeInstructions from "./LeetCodeInstructions";
import VSCodeInstructions from "./VSCodeInstructions";

import styles from "@/styles/Instructions.module.css";

import openedCaret from "../../public/assets/opened-caret.svg";
import closedCaret from "../../public/assets/closed-caret.svg";

export default function CodeEditorInstructions() {
    const [isVisible, setIsVisible] = useState(true);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };
    return (
        <div className="guideContainer">
            <div className={styles.title} onClick={toggleVisibility}>
                <h3>Why We Don't Have an Embedded Code Editor</h3>
                <Image
                    src={isVisible ? openedCaret : closedCaret}
                    alt="caret icon"
                    width={14}
                    height={11}
                />
            </div>
            {isVisible && (
                <p>
                    Our focus is on preparing you for real technical interviews,
                    where you'll typically use either an online coding platform
                    like LeetCode or an IDE like VSCode. By practicing in these
                    environments, you'll build familiarity with the tools you'll
                    encounter during interviews. This approach ensures you're
                    comfortable with industry-standard coding environments, not
                    a custom editor you won't see in actual interviews.
                </p>
            )}
            <LeetCodeInstructions />
            <VSCodeInstructions />
        </div>
    );
}
