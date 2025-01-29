import { useState, useEffect } from "react";

import styles from "@/styles/CodeCheck.module.css";

interface RuntimeProps {
    priorRuntime: string | null;
    onCheck: (userSelection: string) => void;
}

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
                {/* TODO: I want to remember their submited value, but I don't want to stop them from resubmitting */}
                {/* TODO: customize the styling */}
                <select value={userSelection} onChange={handleChange}>
                    <option value="">Select the runtime</option>
                    <option value="O(1)">O(1)</option>
                    <option value="O(log n)">O(log n)</option>
                    <option value="O(n)">O(n)</option>
                    <option value="O(n log n)">O(n log n)</option>
                    <option value="O(n^2)">O(n^2)</option>
                    <option value="O(n^3)">O(n^3)</option>
                    <option value="O(2^n)">O(2^n)</option>
                </select>
                <button onClick={handleCheck} disabled={!userSelection}>
                    Submit
                </button>
            </div>
        </div>
    );
}
