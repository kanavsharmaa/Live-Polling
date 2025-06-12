import { Server, Socket } from "socket.io";
import PollResult from "../models/PollResult";

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
    teacherSocketId: string | null;
    pollTimer?: NodeJS.Timeout | null;
    teacherId: string | null;
} 