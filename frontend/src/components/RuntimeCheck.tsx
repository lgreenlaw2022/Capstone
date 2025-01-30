import { useState, useEffect } from "react";

import styles from "@/styles/CodeCheck.module.css";

interface RuntimeProps {
    priorRuntime: string | null;
    onCheck: (userSelection: string) => void;
}

const RUNTIME_OPTIONS = [
    { value: "", label: "Select the runtime" },
    { value: "O(1)", label: "O(1)" },
    { value: "O(log n)", label: "O(log n)" },
    { value: "O(n)", label: "O(n)" },
    { value: "O(n log n)", label: "O(n log n)" },
    { value: "O(n^2)", label: "O(n^2)" },
    { value: "O(n^3)", label: "O(n^3)" },
    { value: "O(2^n)", label: "O(2^n)" },
];

export default function RuntimeCheck({ priorRuntime, onCheck }: RuntimeProps) {
    const [userSelection, setUserSelection] = useState(priorRuntime || "");

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setUserSelection(event.target.value);
    };

    useEffect(() => {
        setUserSelection(priorRuntime || "");
    }, [priorRuntime]);

    const handleCheck = () => {
        onCheck(userSelection);
    };

    return (
        <div>
            <p>
                <strong>Runtime Complexity</strong>
            </p>
            <p>Evaluate the time complexity of your solution:</p>
            <div className={styles.userInput}>
                <select
                    value={userSelection}
                    onChange={handleChange}
                    aria-label="Runtime complexity"
                >
                    {RUNTIME_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
                
                <button
                    type="button"
                    onClick={handleCheck}
                    disabled={!userSelection}
                    aria-label="Submit runtime complexity"
                >
                    Submit
                </button>
            </div>
        </div>
    );
}
