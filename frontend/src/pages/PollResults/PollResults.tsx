import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../redux/store";
import { useSocket } from "../../hooks/useSocket";
import { socket } from "../../socket";
import { setPollClosed } from "../../redux/slices/pollSlice";
import ParticipantsList from "../../components/poll/ParticipantsList";
import PollResults from "../../components/poll/PollResults";
import Button from "../../components/ui/Button/Button";
import styles from "./PollResults.module.css";

const PollResultsPage: React.FC = () => {
  useSocket();
  const dispatch = useDispatch();
  const { isPollClosed } = useSelector((state: RootState) => state.poll);

  useEffect(() => {
    socket.emit("teacher-join");
    const handlePollClosed = (data: {
      results: Record<string, number>;
      options: any[];
    }) => {
      dispatch(setPollClosed(data));
    };

    socket.on("poll-closed", handlePollClosed);

    return () => {
      socket.off("poll-closed", handlePollClosed);
    };
  }, [dispatch]);

  return (
    <div className={styles.pollResultsContainer}>
      <div className={styles.poll}>
        <PollResults />
        <ParticipantsList />
      </div>
      {isPollClosed && (
        <div className={styles.newQuestionContainer}>
          <Link to="/teacher">
            <Button>+ Ask a new question</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default PollResultsPage;
