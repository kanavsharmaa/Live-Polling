import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PollOption {
  text: string;
  isCorrect?: boolean;
}

interface PollState {
  name: string;
  question: string | null;
  options: PollOption[];
  results: Record<string, number> | null;
  hasAnswered: boolean;
  isConnected: boolean;
  isPollClosed: boolean;
  participants: Record<string, { name: string, answered: boolean }>;
  duration: number;
  isKicked: boolean;
}

const initialState: PollState = {
  name: sessionStorage.getItem('studentName') || '',
  question: null,
  options: [],
  results: null,
  hasAnswered: false,
  isConnected: false,
  isPollClosed: false,
  participants: {},
  duration: 60,
  isKicked: false,
};

export const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setConnectionState: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setKicked: (state, action: PayloadAction<boolean>) => {
        state.isKicked = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
      sessionStorage.setItem('studentName', action.payload);
    },
    setPoll: (state, action: PayloadAction<{ question: string, options: {text: string}[], duration?: number }>) => {
      state.question = action.payload.question;
      state.options = action.payload.options.map(o => ({ ...o, isCorrect: undefined }));
      state.results = null; // Reset results when a new poll arrives
      state.hasAnswered = false;
      state.isPollClosed = false;
      state.duration = action.payload.duration || 60;
    },
    setResults: (state, action: PayloadAction<Record<string, number>>) => {
      state.results = action.payload;
    },
    setPollClosed: (state, action: PayloadAction<{ results: Record<string, number>, options: PollOption[] }>) => {
        state.results = action.payload.results;
        state.options = action.payload.options;
        state.hasAnswered = true;
        state.isPollClosed = true;
    },
    setParticipants: (state, action: PayloadAction<Record<string, { name: string, answered: boolean }>>) => {
        state.participants = action.payload;
    },
    setHasAnswered: (state, action: PayloadAction<boolean>) => {
        state.hasAnswered = action.payload;
    }
  },
});

export const { setConnectionState, setName, setPoll, setResults, setHasAnswered, setPollClosed, setParticipants, setKicked } = pollSlice.actions;

export default pollSlice.reducer; 