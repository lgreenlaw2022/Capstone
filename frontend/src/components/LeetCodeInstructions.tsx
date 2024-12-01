import { useState } from "react";
import Image from "next/image";
import openedCaret from "../../public/assets/opened-caret.svg";
import closedCaret from "../../public/assets/closed-caret.svg";
import styles from "@/styles/Instructions.module.css";

export default function LeetCodeInstructions() {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <div className="guideContainer">
            <div className={styles.title} onClick={toggleVisibility}>
                <h3>Using LeetCode for Practice </h3>
                <Image
                    src={isVisible ? openedCaret : closedCaret}
                    alt="caret icon"
                    width={14}
                    height={11}
                />
            </div>
            {isVisible && (
                <ol>
                    <li>
                        Create a LeetCode account at leetcode.com if you haven't
                        already
                    </li>
                    <li>
                        Navigate to the problem on LeetCode that matches our
                        problem description
                    </li>
                    <li>
                        Use LeetCode's built-in editor to write and test your
                        solution
                    </li>
                    <li>Run the provided test cases to verify your solution</li>
                    <li>Submit your code to check it against all test cases</li>
                    <li>Review the execution time and memory usage metrics</li>
                    <li>
                        Study the solution discussions after successfully
                        solving the problem
                    </li>
                </ol>
            )}
        </div>
    );
}