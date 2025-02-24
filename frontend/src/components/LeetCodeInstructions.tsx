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
        <div>
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
                <div className={styles.textBlock}>
                    <p className="boldPoint">
                        For a complete beginners guide to solving problems in
                        LeetCode, visit{" "}
                        <a
                            href="https://leetcode.com/explore/featured/card/the-leetcode-beginners-guide/678/sql-data-structure/4352/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            this link
                        </a>{" "}
                    </p>
                    <ol>
                        <li>
                            Create a LeetCode account at{" "}
                            <a
                                href="https://leetcode.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                leetcode.com
                            </a>{" "}
                            if you haven't already
                        </li>
                        <li>
                            Use the LeetCode link at the top of this page to
                            access the problem
                        </li>
                        <li>
                            Use LeetCode's built-in editor to write and test
                            your solution
                        </li>
                        <li>
                            Run the provided test cases to verify your solution
                        </li>
                        <li>
                            Submit your code to check it against all test cases
                        </li>

                        <li>
                            Review the execution time and memory usage metrics
                        </li>
                        <li>
                            Study the solution discussions after successfully
                            solving the problem to understand alternative
                            approaches
                        </li>
                    </ol>
                </div>
            )}
        </div>
    );
}
