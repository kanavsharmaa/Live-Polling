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
    participants: { [socketId: string]: { name: string, answered: boolean } };
    isPollActive: boolean;
    duration: number;
    teacherSocketId: string | null;
    pollTimer?: NodeJS.Timeout | null;
} 