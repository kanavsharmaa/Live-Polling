import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import { socket } from "../../socket";
import PollForm from "../../components/poll/PollForm";
import styles from "./TeacherPage.module.css";
import Tag from "../../components/ui/Tag/Tag";
import RoomID from "../../components/RoomID/RoomID";

const TeacherPage: React.FC = () => {
  useSocket();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  useEffect(() => {
    if (roomId) {
      socket.emit("teacher-join", { roomId });
    }

    const handlePollCreated = () => {
      navigate(`/results/${roomId}`);
    };
    socket.on("poll-created", handlePollCreated);
    return () => {
      socket.off("poll-created", handlePollCreated);
    };
  }, [navigate, roomId]);

  return (
    <div className={styles.teacherPageContainer}>
      <Tag name="Intervue Poll" />
      <div className={styles.header}>
        <h1 className="heading1">Welcome, Teacher!</h1>
        <RoomID roomId={roomId} />
        <div className={styles.body}>
          <h3 className="subHeading3">
            Share this ID with your students to have them join the poll.
          </h3>
          <h3 className="subHeading3">
            You'll have the ability to create and manage polls, ask questions,
            and monitor your students' responses in real-time.
          </h3>
        </div>
      </div>
      <PollForm roomId={roomId} />
    </div>
  );
};

export default TeacherPage;
