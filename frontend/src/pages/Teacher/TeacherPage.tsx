import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import { socket } from "../../socket";
import PollForm from "../../components/poll/PollForm";
import styles from "./TeacherPage.module.css";
import Tag from "../../components/ui/Tag/Tag";

const TeacherPage: React.FC = () => {
  useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("teacher-join");

    const handlePollCreated = () => {
      navigate("/results");
    };
    socket.on("poll-created", handlePollCreated);
    return () => {
      socket.off("poll-created", handlePollCreated);
    };
  }, [navigate]);

  return (
    <div className={styles.teacherPageContainer}>
      <Tag name="Intervue Poll" />
      <div className={styles.header}>
        <h1 className="heading1">Let's Get Started</h1>
        <h3 className="subHeading3">
          You'll have the ability to create and manage polls, ask questions, and
          monitor your students' responses in real-time.
        </h3>
      </div>
      <PollForm />
    </div>
  );
};

export default TeacherPage;
