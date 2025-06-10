export interface Participant {
    name: string;
    answered: boolean;
}

export interface PollOption {
    text: string;
    isCorrect: boolean;
}

export interface PollState {
    question: string | null;
    options: PollOption[];
    results: Record<string, number>;
    participants: Record<string, Participant>;
    isPollActive: boolean;
    duration: number;
} 