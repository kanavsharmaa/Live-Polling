import { configureStore } from '@reduxjs/toolkit';
import pollReducer from './slices/pollSlice';

export const store = configureStore({
  reducer: {
    poll: pollReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {poll: PollState}
export type AppDispatch = typeof store.dispatch; 