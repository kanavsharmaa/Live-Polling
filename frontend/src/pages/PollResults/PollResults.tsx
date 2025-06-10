import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
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
  const { roomId } = useParams<{ roomId: string }>();
  const { isPollClosed } = useSelector((state: RootState) => state.poll);

  useEffect(() => {
    if (roomId) {
      socket.emit("teacher-join", { roomId });
    }
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
  }, [dispatch, roomId]);

  return (
    <div className={styles.pollResultsContainer}>
      <div className={styles.poll}>
        <PollResults />
        <ParticipantsList roomId={roomId} />
      </div>
      {isPollClosed && (
        <div className={styles.newQuestionContainer}>
          <Link to={`/teacher/${roomId}`}>
            <Button>+ Ask a new question</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default PollResultsPage;
