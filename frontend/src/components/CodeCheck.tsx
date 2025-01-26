import { useState } from "react";

import styles from "@/styles/CodeCheck.module.css";

export default function CodeCheck() {
    const [userOutput, setUserOutput] = useState("");
    const [feedback, setFeedback] = useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserOutput(event.target.value);
    };

    return (
        <div className={styles.codeCheck}>
            <h3>Code Check</h3>
            <p>
                Before viewing the solution guide, make sure your code passes
                the following test cases:
            </p>
            {/* TODO: this will likely be a new component */}
            <p>Input: <code>[1,2]</code></p>
            <div className={styles.userInput}>
                <p>Output:</p>
                <input
                    type="text"
                    value={userOutput}
                    onChange={handleChange}
                    placeholder="Enter your output"
                />
                <button>Check</button>
            </div>
            {feedback && <p>{feedback}</p>}
        </div>
    );
}
