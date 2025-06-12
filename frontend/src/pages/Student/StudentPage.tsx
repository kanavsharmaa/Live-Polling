import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from "../../hooks/useSocket";
import { socket } from "../../socket";
import {
  setName,
  setHasAnswered,
  setPollClosed,
  setStudentAnswer,
} from "../../redux/slices/pollSlice";
import styles from "./StudentPage.module.css";
import pollResultsStyles from "../../components/poll/PollResults.module.css";
import { RootState } from "../../redux/store";
import Tag from "../../components/ui/Tag/Tag";
import Button from "../../components/ui/Button/Button";
import InputBar from "../../components/ui/InputBar/InputBar";
import PollResults from "../../components/poll/PollResults";
import { useParams, useNavigate } from "react-router-dom";

const StudentPage = () => {
  useSocket();
  const dispatch = useDispatch();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const {
    name,
    question,
    options,
    results,
    hasAnswered,
    isConnected,
    duration,
    isKicked,
    studentAnswer,
    teacherDisconnected,
  } = useSelector((state: RootState) => state.poll);
  const [localName, setLocalName] = useState("");
  const [localRoomId, setLocalRoomId] = useState("");
  const [timer, setTimer] = useState(duration);
  const totalVotes = results
    ? Object.values(results).reduce((sum, count) => sum + count, 0)
    : 0;

  useEffect(() => {
    const savedName = sessionStorage.getItem("studentName");
    if (savedName && roomId) {
      setLocalName(savedName);
      dispatch(setName(savedName));
      socket.emit("join", { name: savedName, roomId });
    }
  }, [dispatch, roomId]);

  useEffect(() => {
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

  useEffect(() => {
    if (question && !hasAnswered) {
      setTimer(duration);
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer > 1) {
            return prevTimer - 1;
          } else {
            clearInterval(interval);
            return 0;
          }
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [question, hasAnswered, dispatch, duration]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localName.trim() && localRoomId.trim()) {
      sessionStorage.setItem("studentName", localName);
      dispatch(setName(localName));
      navigate(`/student/${localRoomId}`);
    } else if (localName.trim() && roomId) {
      sessionStorage.setItem("studentName", localName);
      dispatch(setName(localName));
      socket.emit("join", { name: localName, roomId });
    }
  };

  const handleAnswerSubmit = (option: string) => {
    socket.emit("submit-answer", { answer: option, roomId });
    dispatch(setHasAnswered(true));
    dispatch(setStudentAnswer(option));
  };

  useEffect(() => {
    console.log("teacherDisconnected: ", teacherDisconnected);
  }, [teacherDisconnected]);

  if (!roomId || !name) {
    return (
      <div className={styles.studentPageContainer}>
        <Tag name="Intervue Poll" />
        <div className={styles.header}>
          <h1 className="heading1">Let's Get Started</h1>
          <h3 className={`subHeading3 ${styles.headerText}`}>
            If you're a student, you'll be able to{" "}
            <strong>submit your answers</strong>, participate in live polls, and
            see how your responses compare with your classmates
          </h3>
        </div>
        <form onSubmit={handleNameSubmit} className={styles.formContainer}>
          <div className={styles.inputContainer}>
            Enter Your Name
            <InputBar
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Your Name"
              required
            />
          </div>
          {!roomId && (
            <div className={styles.inputContainer}>
              Enter Room ID
              <InputBar
                value={localRoomId}
                onChange={(e) => setLocalRoomId(e.target.value)}
                placeholder="Room ID"
                required
              />
            </div>
          )}
          <div className={styles.buttonContainer}>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      </div>
    );
  }

  if (!question) {
    if (teacherDisconnected) {
      return (
        <div className={styles.kickedOutContainer}>
          <Tag name="Intervue Poll" />
          <div className={styles.kickedOutContent}>
            <h1 className="heading1">The teacher has left the session.</h1>
            <h3 className="subHeading3">
              The poll has ended. You can close this window.
            </h3>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.waitingContainer}>
        <Tag name="Intervue Poll" />
        <div className={styles.spinner}></div>
        <p>Wait for the teacher to ask questions..</p>
      </div>
    );
  }

  if (isKicked) {
    return (
      <div className={styles.kickedOutContainer}>
        <Tag name="Intervue Poll" />
        <div className={styles.kickedOutContent}>
          <h1 className="heading1">You've been Kicked out!</h1>
          <h3 className="subHeading3">
            Looks like the teacher had removed you from the poll system. Please
            Try again sometime.
          </h3>
        </div>
      </div>
    );
  }

  if (teacherDisconnected) {
    return (
      <div className={styles.kickedOutContainer}>
        <Tag name="Intervue Poll" />
        <div className={styles.kickedOutContent}>
          <h1 className="heading1">The teacher has left the session.</h1>
          <h3 className="subHeading3">
            The poll has ended. You can close this window.
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.studentPageContainer}>
      <div className={styles.header}>
        <Tag name="Intervue Poll" />
        <h1>Student View</h1>
        <p>
          Welcome, {name}! Connection status:{" "}
          {isConnected ? "Connected" : "Disconnected"}
        </p>
      </div>

      {question && !hasAnswered && (
        <div className={pollResultsStyles.pollResults}>
          <div className={pollResultsStyles.questionHeader}>{question}</div>
          <p className={styles.timer}>Time remaining: {timer}s</p>
          <div className={pollResultsStyles.optionsList}>
            {options.map((option, index) => (
              <div key={option.text} className={pollResultsStyles.option}>
                <div className={pollResultsStyles.optionLeft}>
                  <div className={pollResultsStyles.optionNumber}>
                    {index + 1}
                  </div>
                  <div className={pollResultsStyles.optionText}>
                    {option.text}
                  </div>
                </div>
                <div className={pollResultsStyles.optionRight}>
                  <Button onClick={() => handleAnswerSubmit(option.text)}>
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasAnswered && question && (
        <>
          <h3 className="heading3">Previous Question</h3>
          <PollResults />
          {studentAnswer && (
            <div className={styles.answerResult}>
              <p>You answered: {studentAnswer}</p>
              <p>
                {options.find((o) => o.text === studentAnswer)?.isCorrect
                  ? "Your answer is correct!"
                  : "Your answer is incorrect."}
              </p>
            </div>
          )}
          <div className={styles.spinner}></div>
          <p>Wait for the teacher to ask questions..</p>
        </>
      )}
    </div>
  );
};

export default StudentPage;
