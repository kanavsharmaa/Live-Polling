import React, { useEffect, useState } from "react";
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
import RoomID from "../../components/RoomID/RoomID";
import PreviousPolls from "../../components/poll/PreviousPolls";

const PollResultsPage: React.FC = () => {
  useSocket();
  const dispatch = useDispatch();
  const { roomId } = useParams<{ roomId: string }>();
  const { isPollClosed } = useSelector((state: RootState) => state.poll);
  const [showPreviousPolls, setShowPreviousPolls] = useState(false);

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
      <RoomID roomId={roomId} />
      <div className={styles.poll}>
        <PollResults />
        <ParticipantsList roomId={roomId} />
      </div>
      {isPollClosed && (
        <div className={styles.actionsContainer}>
          <div className={styles.newQuestionContainer}>
            <Link to={`/teacher/${roomId}`}>
              <Button>+ Ask a new question</Button>
            </Link>
          </div>
          <div className={styles.previousPollsButton}>
            <Button onClick={() => setShowPreviousPolls(!showPreviousPolls)}>
              {showPreviousPolls
                ? "Hide Previous Questions"
                : "View Previous Questions"}
            </Button>
          </div>
        </div>
      )}
      {showPreviousPolls && <PreviousPolls />}
    </div>
  );
};

export default PollResultsPage; 