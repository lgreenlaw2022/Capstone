import { useEffect, useState } from "react";

import styles from "@/styles/CodeCheck.module.css";

interface TestCaseProps {
    input: string;
    output: string;
    verified: boolean;
    onCheck: (userOutput: string, correctOutput: string) => void;
}

export default function TestCase({input, output, verified, onCheck}: TestCaseProps) {
    const [userOutput, setUserOutput] = useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserOutput(event.target.value);
    };

    const handleCheck = () => {
        onCheck(userOutput, output);
    };

    return (
        <div>
            <p>
                Input: <code>{input}</code>
            </p>
            <div className={styles.userInput}>
                <p>Output:</p>
                <input
                    type="text"
                    value={verified ? output : userOutput}
                    onChange={handleChange}
                    placeholder="Enter your output"
                    disabled={verified}
                />
                <button onClick={handleCheck} disabled={verified}>Check</button>
            </div>
        </div>
    );
}
