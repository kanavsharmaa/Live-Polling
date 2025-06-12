import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { socket } from '../socket';
import { setConnectionState, setPoll, setResults, setParticipants, setKicked, setTeacherDisconnected } from '../redux/slices/pollSlice';
import { AppDispatch } from '../redux/store';
import { Socket } from 'socket.io-client';

interface PollOption {
  text: string;
}

export const useSocket = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    function onConnect() {
      dispatch(setConnectionState(true));
    }

    function onDisconnect(reason: Socket.DisconnectReason) {
      dispatch(setConnectionState(false));
      if (reason === 'io server disconnect') {
        dispatch(setKicked(true));
      }
    }

    function onNewQuestion(value: { question: string; options: PollOption[], duration: number }) {
      dispatch(setPoll(value));
    }

    function onPollResults(value: Record<string, number>) {
      dispatch(setResults(value));
    }

    function onParticipantsList(value: Record<string, { name: string, answered: boolean }>) {
      dispatch(setParticipants(value));
    }

    function onTeacherDisconnected() {
      dispatch(setTeacherDisconnected(true));
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new-question', onNewQuestion);
    socket.on('poll-results', onPollResults);
    socket.on('participants-list', onParticipantsList);
    socket.on('teacher-disconnected', onTeacherDisconnected);

    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new-question', onNewQuestion);
      socket.off('poll-results', onPollResults);
      socket.off('participants-list', onParticipantsList);
      socket.off('teacher-disconnected', onTeacherDisconnected);
    };
  }, [dispatch]);
}; 