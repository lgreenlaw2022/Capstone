import React, { useState } from "react";
import Image from "next/image";

import LeetCodeInstructions from "./LeetCodeInstructions";
import VSCodeInstructions from "./VSCodeInstructions";

import styles from "@/styles/Instructions.module.css";

import openedCaret from "../../public/assets/opened-caret.svg";
import closedCaret from "../../public/assets/closed-caret.svg";

export default function CodeEditorInstructions() {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };
    return (
        <div className="guideContainer">
            <p>
                To become familiar with standard technical interview problem
                editor tools, we recommend you solve this problem on LeetCode.
                You can find the problem by following the LeetCode link at the
                top of the problem description.
            </p>
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
