export interface QuizQuestion {
    id: number;
    title: string;
    options: {
        id: number;
        option_text: string;
        is_correct: boolean;
    }[];
}