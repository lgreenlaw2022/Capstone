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

    useEffect(() => {
        if (moduleId) {
            // Set the default content directly
            setContent(`
                <div class="guideContainer">
                <h1>Solution Walkthrough: Contains Duplicate</h1>
                <h3> Clarifying Questions</h3>
                <p>Are there any time or space restrictions?</p>
                </p>
                <p class="boldPoint">This indicates a hash table (dictionary) is a good approach to solve the problem.</p>`);
        }
    }, [moduleId]);

    return (
        <div className={styles.container}>
            {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default ChallengeSolutionPage;
