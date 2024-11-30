import { useState } from "react";
import Image from "next/image";
import openedCaret from "../../public/assets/opened-caret.svg";
import closedCaret from "../../public/assets/closed-caret.svg";

import styles from "@/styles/Instructions.module.css";

export default function VSCodeInstructions() {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <div className="guideContainer">
            <div className={styles.title} onClick={toggleVisibility}>
                <h3>Using VSCode for Practice </h3>
                <Image
                    src={isVisible ? openedCaret : closedCaret}
                    alt="caret icon"
                    width={14}
                    height={11}
                />
            </div>
            {isVisible && (
                <ol>
                    <li>Set up your local development environment:</li>
                    <ul>
                        <li>Install VSCode from code.visualstudio.com</li>
                        <li>
                            Install the necessary language extensions (Python)
                        </li>
                        <li>Set up a dedicated folder for coding practice</li>
                    </ul>
                    <li>Create a new file for each problem:</li>
                    <ul>
                        <li>
                            Use meaningful file names (e.g., two_sum.py,
                            merge_intervals.py)
                        </li>
                        <li>
                            Include the problem description as comments at the
                            top
                        </li>
                        <li>Copy our test cases into the file</li>
                    </ul>
                    <li>Write and test your solution:</li>
                    <ul>
                        <li>
                            Implement a solution class/function as specified in
                            the problem
                        </li>
                        <li>Write a main function to run test cases</li>
                        <li>
                            Use print statements or the debugger to verify your
                            solution
                        </li>
                        <li>
                            Run your code using VSCode's integrated terminal
                        </li>
                    </ul>
                    <li>Tips for an interview-like experience</li>
                    <ul>
                        <li>
                            Practice without auto-completion to simulate
                            interview conditions
                        </li>
                        <li>
                            Set a timer to practice within typical interview
                            time constraints
                        </li>
                        <li>
                            Write your own test cases before running the
                            provided ones
                        </li>
                    </ul>
                </ol>
            )}
        </div>
    );
}
