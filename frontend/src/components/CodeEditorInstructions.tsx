import LeetCodeInstructions from "./LeetCodeInstructions";
import VSCodeInstructions from "./VSCodeInstructions";

export default function CodeEditorInstructions() {
    return (
        <div className="guideContainer">
            <h3>Why We Don't Have an Embedded Code Editor</h3>
            <p>
                While many platforms offer embedded code editors, we've
                intentionally chosen not to include one. Our focus is on
                preparing you for real technical interviews, where you'll
                typically use either an online coding platform like LeetCode or
                an IDE like VSCode. By practicing in these authentic
                environments, you'll build muscle memory and familiarity with
                the exact tools you'll encounter during interviews. This
                approach ensures you're comfortable with industry-standard
                coding environments rather than a custom editor you won't see in
                actual interviews.
            </p>
            <LeetCodeInstructions />
            <VSCodeInstructions />
        </div>
    );
}