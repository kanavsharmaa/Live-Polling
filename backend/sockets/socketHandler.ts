import { Server, Socket } from "socket.io";
import { PollState, PollOption } from "../types/poll";
import PollResult from "../models/PollResult";

interface Rooms {
  [roomId: string]: PollState;
}

export const handleSocketConnection = (io: Server) => {
  const rooms: Rooms = {};

  const getRoom = (roomId: string): PollState => {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        question: null,
        options: [],
        results: {},
        participants: {},
        isPollActive: false,
        duration: 60,
        teacherSocketId: null,
      };
    }
    return rooms[roomId];
  };

  const closePoll = (roomId: string) => {
    const room = getRoom(roomId);
    if (room.pollTimer) {
      clearTimeout(room.pollTimer);
      room.pollTimer = null;
    }
    io.to(roomId).emit("poll-closed", {
      results: room.results,
      options: room.options,
    });
    room.isPollActive = false;
    
    // Save poll results to DB
    if (room.teacherSocketId && room.question) {
      const pollToSave = new PollResult({
        teacherId: room.teacherSocketId,
        question: room.question,
        options: room.options.map(option => ({
          text: option.text,
          votes: room.results[option.text] || 0
        }))
      });
      pollToSave.save().catch(err => console.error("Error saving poll:", err));
    }
  };

  const resetPoll = (roomId: string) => {
    const room = getRoom(roomId);
    if (room.pollTimer) {
      clearTimeout(room.pollTimer);
      room.pollTimer = null;
    }
    room.question = null;
    room.options = [];
    room.results = {};
    room.isPollActive = false;
    room.duration = 60;
    Object.values(room.participants).forEach((p) => (p.answered = false));
  };

  const emitParticipants = (roomId: string) => {
    const room = getRoom(roomId);
    if (room.teacherSocketId) {
      const participantsForTeacher = { ...room.participants };
      io.to(room.teacherSocketId).emit(
        "participants-list",
        participantsForTeacher
      );
    }
  };

  io.on("connection", (socket: Socket) => {
    console.log("a user connected:", socket.id);

    socket.on("teacher-join", ({ roomId }: { roomId: string }) => {
      socket.join(roomId);
      const room = getRoom(roomId);
      room.teacherSocketId = socket.id;
      room.participants[socket.id] = { name: "Teacher", answered: false };
      emitParticipants(roomId);
    });

    socket.on("join", ({ name, roomId }: { name: string; roomId: string }) => {
      socket.join(roomId);
      const room = getRoom(roomId);
      room.participants[socket.id] = { name, answered: false };
      emitParticipants(roomId);

      if (room.question) {
        socket.emit("new-question", {
          question: room.question,
          options: room.options.map((o) => ({ text: o.text })),
          duration: room.duration,
        });
      }

      if (room.results && Object.keys(room.results).length > 0) {
        if (!room.isPollActive) {
          socket.emit("poll-closed", {
            results: room.results,
            options: room.options,
          });
        }
      }
    });

    socket.on(
      "create-poll",
      ({
        question,
        options,
        duration,
        roomId,
      }: {
        question: string;
        options: PollOption[];
        duration: number;
        roomId: string;
      }) => {
        const room = getRoom(roomId);
        if (!room.isPollActive) {
          resetPoll(roomId);
          room.question = question;
          room.options = options;
          room.duration = duration > 0 ? duration : 60;
          room.results = options.reduce((acc: Record<string, number>, option: PollOption) => {
            acc[option.text] = 0;
            return acc;
          }, {});

          room.isPollActive = true;
          io.to(roomId).emit("new-question", {
            question,
            options: options.map((o) => ({ text: o.text })),
            duration: room.duration,
          });
          socket.emit("poll-created");

          const pollDuration = room.duration * 1000;
          room.pollTimer = setTimeout(() => {
            closePoll(roomId);
          }, pollDuration);
        }
      }
    );

    socket.on(
      "submit-answer",
      ({ answer, roomId }: { answer: string; roomId: string }) => {
        const room = getRoom(roomId);
        if (
          room.isPollActive &&
          room.options.some((opt) => opt.text === answer) &&
          room.participants[socket.id] &&
          !room.participants[socket.id].answered
        ) {
          room.results[answer]++;
          room.participants[socket.id].answered = true;
          io.to(roomId).emit("poll-results", room.results);

          const studentParticipants = Object.values(room.participants).filter(
            (p) => p.name !== "Teacher"
          );
          if (
            studentParticipants.length > 0 &&
            studentParticipants.every((p) => p.answered)
          ) {
            closePoll(roomId);
          }
        }
      }
    );

    socket.on(
      "kick-student",
      ({ studentId, roomId }: { studentId: string; roomId: string }) => {
        const room = getRoom(roomId);
        if (socket.id === room.teacherSocketId) {
          const studentSocket = io.sockets.sockets.get(studentId);
          if (studentSocket) {
            studentSocket.emit("kicked");
            studentSocket.disconnect(true);
            delete room.participants[studentId];
            emitParticipants(roomId);
          }
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("user disconnected:", socket.id);
      for (const roomId in rooms) {
        const room = rooms[roomId];
        if (room.participants[socket.id]) {
          delete room.participants[socket.id];
          emitParticipants(roomId);

          if (room.isPollActive) {
            const studentParticipants = Object.values(
              room.participants
            ).filter((p) => p.name !== "Teacher");
            if (
              studentParticipants.length === 0 ||
              studentParticipants.every((p) => p.answered)
            ) {
              closePoll(roomId);
            }
          }
        }
      }
    });
  });
}; 