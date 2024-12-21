import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { getCodeChallenge, submitCompleteModule } from "../../../api/api";
import styles from "@/styles/Content.module.css";

const ChallengeSolutionPage: React.FC = () => {
    const router = useRouter();
    const { moduleId } = router.query;
    const [content, setContent] = useState<string | null>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const code = `class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        counts = {}
        for num in nums:
            if num in counts:
                return True
            counts[num] = 1
        return False`;

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        // here is the editor instance, store it in `useRef` for further usage
        editorRef.current = editor;
    };

    const handleComplete = async () => {
        try {
            await submitCompleteModule(Number(moduleId));
            router.push("/learn");
        } catch (error) {
            console.error("Error setting module as complete:", error);
        }
    };

    useEffect(() => {
        if (moduleId) {
            // Set the default content directly
            setContent(`
                <div class="guideContainer">
                <h1>Solution Walkthrough: Contains Duplicate</h1>

                <h2>Understand the problem</h2>
                <p><strong>Clarifying Questions</strong></p>
                <p> Q: Are there any time or space restrictions?</p>
                <p> A: There are no space restrictions but the task should be accomplished in linear time.</p>
                <p class="boldPoint">This indicates a hash table (dictionary) is a good approach to solve the problem.</p>
                <p> Q: Is it possible for the array to be empty and what should be returned in that case?
                <p> A: No, there will be at least a single number. </p>

                <p><strong>Test Cases</strong></p>
                <p>
                    Input: nums = [1,2,3,1]<br />
                    Output: true, there are two 1's in the array.
                </p>
                
                <h2>Match</h2>
                <p><strong>Common solutions to strings and array problems:</strong></p>
                <ol>
                    <li>Sort. We can sort the array to look if there are two of the same number next to each other. Thus, we can detect if there is a match by examining each item in the array once. However, we cannot guarantee the sort will run in linear time.</li>
                    <li>Sliding window or Two pointer solution. Neither of these solutions are helpful since we must sort the array first and sorting already does the job.</li>
                    <li>Storing in hash table or hash set. This is a good solution because hash tables can store counts for each number in the array easily. We can detect if a number is already in the table in linear time and thus, we only need to review the list once.</li>
                </ol>

                <h2>Plan</h2>
                <ol>
                    <li>Make a dictionary</li>
                    <li>For each number in num
                        <ol>
                            <li>Check if the number is already a key in the dictionary</li>
                            <li>If yes, return True</li>
                            <li>Else, add it to the dictionary</li>
                        </ol>
                    </li>
                    <li>Return False, no match was found</li>
                </ol>

                <h2>Complexity Analysis</h2>
                <p><strong>Time Complexity:<strong></p>
                <p> O(n) because we only iterate over the array once and hash table operations are in constant time.</p>
                <p><strong>Space Complexity:<strong></p>   
                <p> O(n) because the size of the dictionary scales with the length of the array.</p>
                
                <h2>Code Solution </h2>

                `);
        }
    }, [moduleId]);

    if (!content) {
        return <p>Loading...</p>;
    }

    return (
        <div className={styles.container}>
            <div dangerouslySetInnerHTML={{ __html: content }} />
            <Editor
                height="30vh"
                width="100%"
                defaultLanguage="python"
                value={code}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                className={styles.editor}
                options={{
                    fontSize: 14,
                    minimap: {
                        enabled: false,
                    },
                    readOnly: true,
                    contextmenu: false,
                }}
            />
            <button
                onClick={handleComplete}
                aria-label="Mark code solution as complete"
            >
                Complete
            </button>
        </div>
    );
};

export default ChallengeSolutionPage;
