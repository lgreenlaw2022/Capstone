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
        <div>
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
                <ol className={styles.textBlock}>
                    <li>Set up your local development environment:</li>
                    <ul>
                        <p className="boldPoint">
                            For an official Getting Started tutorial, visit{" "}
                            <a
                                href="https://code.visualstudio.com/docs/getstarted/getting-started"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                this link
                            </a>
                        </p>
                        <li>
                            Install VSCode from{" "}
                            <a
                                href="https://code.visualstudio.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                code.visualstudio.com
                            </a>
                        </li>
                        <li>
                            Install the necessary language extensions (install
                            Python{" "}
                            <a
                                href="https://marketplace.visualstudio.com/items?itemName=ms-python.python"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                at this link
                            </a>{" "}
                            or from the Extensions tab in VSCode)
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
                            code snippet above
                        </li>
                        <li>
                            Write a{" "}
                            <a
                                href="https://realpython.com/python-main-function/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                main function
                            </a>{" "}
                            to run test cases
                        </li>
                        <li>
                            Use print statements or the debugger to verify your
                            solution
                        </li>
                        <li>
                            Run your code using VSCode's integrated terminal.
                            For help, visit{" "}
                            <a
                                href="https://code.visualstudio.com/docs/terminal/basics"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                this page
                            </a>
                            .
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
