import { Server, Socket } from "socket.io";
import { PollState, PollOption } from "../types/poll";

export const handleSocketConnection = (io: Server) => {
    let teacherSocketId: string | null = null;

    let pollState: PollState = {
        question: null,
        options: [],
        results: {},
        participants: {},
        isPollActive: false,
        duration: 60,
    };

    let pollTimer: NodeJS.Timeout | null = null;

    const closePoll = () => {
        if (pollTimer) {
            clearTimeout(pollTimer);
            pollTimer = null;
        }
        io.emit('poll-closed', { results: pollState.results, options: pollState.options });
        pollState.isPollActive = false;
    };

    const resetPoll = () => {
        if (pollTimer) {
            clearTimeout(pollTimer);
            pollTimer = null;
        }
        pollState = {
            question: null,
            options: [],
            results: {},
            participants: pollState.participants, // Keep participants
            isPollActive: false,
            duration: 60,
        };
        Object.values(pollState.participants).forEach(p => p.answered = false);
    }

    const emitParticipants = (socketIdToEmitTo: string) => {
        const participantsForTeacher = { ...pollState.participants };
        delete participantsForTeacher[socketIdToEmitTo];
        io.to(socketIdToEmitTo).emit('participants-list', participantsForTeacher);
    }

    io.on('connection', (socket: Socket) => {
        console.log('a user connected:', socket.id);
        pollState.participants[socket.id] = { name: 'Anonymous', answered: false };
        if (teacherSocketId) {
            emitParticipants(teacherSocketId);
        }

        // Send current poll state to newly connected client
        if (pollState.question) {
            socket.emit('new-question', { question: pollState.question, options: pollState.options.map(o => ({ text: o.text })), duration: pollState.duration });
        }

        if (pollState.results && Object.keys(pollState.results).length > 0) {
            if (!pollState.isPollActive) {
                socket.emit('poll-closed', { results: pollState.results, options: pollState.options });
            }
        }

        socket.on('teacher-join', () => {
            teacherSocketId = socket.id;
            if (pollState.participants[socket.id]) {
                pollState.participants[socket.id].name = 'Teacher';
            }
            emitParticipants(teacherSocketId);
        });

        socket.on('join', ({ name }: { name: string }) => {
            if (pollState.participants[socket.id]) {
                pollState.participants[socket.id].name = name;
            }
            if (teacherSocketId) {
                emitParticipants(teacherSocketId);
            }
        });

        socket.on('create-poll', ({ question, options, duration }: { question: string, options: PollOption[], duration: number }) => {
            if (!pollState.isPollActive) {
                teacherSocketId = socket.id;
                if (pollState.participants[socket.id]) {
                    pollState.participants[socket.id].name = 'Teacher';
                }
                resetPoll();
                pollState.question = question;
                pollState.options = options;
                pollState.duration = duration > 0 ? duration : 60;
                pollState.results = options.reduce((acc: Record<string, number>, option: PollOption) => {
                    acc[option.text] = 0;
                    return acc;
                }, {});

                pollState.isPollActive = true;
                io.emit('new-question', { question, options: options.map(o => ({ text: o.text })), duration: pollState.duration });
                socket.emit('poll-created');

                const pollDuration = pollState.duration * 1000;
                pollTimer = setTimeout(() => {
                    closePoll();
                }, pollDuration);
            }
        });

        socket.on('submit-answer', ({ answer }: { answer: string }) => {
            if (pollState.isPollActive && pollState.options.some(opt => opt.text === answer) && !pollState.participants[socket.id].answered) {
                pollState.results[answer]++;
                pollState.participants[socket.id].answered = true;
                io.emit('poll-results', pollState.results);

                const studentParticipants = Object.values(pollState.participants).filter(p => p.name !== 'Teacher');
                if (studentParticipants.length > 0 && studentParticipants.every(p => p.answered)) {
                    closePoll();
                }
            }
        });

        socket.on('kick-student', ({ studentId }: { studentId: string }) => {
            if (socket.id === teacherSocketId) {
                const studentSocket = io.sockets.sockets.get(studentId);
                if (studentSocket) {
                    studentSocket.disconnect(true);
                }
            }
        });

        socket.on('disconnect', () => {
            console.log('user disconnected:', socket.id);
            delete pollState.participants[socket.id];
            if (teacherSocketId) {
                emitParticipants(teacherSocketId);
            }

            if (pollState.isPollActive) {
                const studentParticipants = Object.values(pollState.participants).filter(p => p.name !== 'Teacher');
                if (studentParticipants.length === 0 || studentParticipants.every(p => p.answered)) {
                    closePoll();
                }
            }
        });
    });
}; 