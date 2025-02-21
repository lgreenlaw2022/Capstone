import { useState } from "react";

import styles from "@/styles/CodeCheck.module.css";

interface TestCaseProps {
    input: string;
    outputs: string[];
    verified: boolean;
    onCheck: (userOutput: string, correctOutputs: string[]) => void;
}

export default function TestCase({
    input,
    outputs,
    verified,
    onCheck,
}: TestCaseProps) {
    const [userOutput, setUserOutput] = useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserOutput(event.target.value);
    };

    const handleCheck = () => {
        onCheck(userOutput, outputs);
    };

    return (
        <div className={styles.testCase}>
            <p>
                Input: <code>{input}</code>
            </p>
            <div className={styles.userInput}>
                <p>Output:</p>
                <input
                    type="text"
                    value={verified ? outputs[0] : userOutput} // TODO: this default might not actually match what they submitted
                    onChange={handleChange}
                    placeholder="Enter your output"
                    disabled={verified}
                    aria-label="Test case output"
                    maxLength={1000}
                />
                <button
                    type="button"
                    onClick={handleCheck}
                    disabled={verified}
                    aria-label="Check test case output"
                >
                    Check
                </button>
            </div>
        </div>
    );
}
