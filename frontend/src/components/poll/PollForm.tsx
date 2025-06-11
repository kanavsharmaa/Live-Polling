import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { socket } from "../../socket";
import Button from "../ui/Button/Button";
import styles from "./PollForm.module.css";
import InputBar from "../ui/InputBar/InputBar";
import ParticipantsList from "./ParticipantsList";

interface PollOption {
  text: string;
  isCorrect: boolean;
}

const PollForm: React.FC<{ roomId: string | undefined }> = ({ roomId }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<PollOption[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [duration, setDuration] = useState(60);
  const [error, setError] = useState<string | null>(null);

  const { participants } = useSelector((state: RootState) => state.poll);
  const studentParticipants = Object.entries(participants).filter(
    ([, p]) => p.name !== "Teacher"
  );

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
    setError(null);
  };

  const handleCorrectnessChange = (selectedIndex: number) => {
    const newOptions = options.map((option, index) => ({
      ...option,
      isCorrect: index === selectedIndex,
    }));
    setOptions(newOptions);
    setError(null);
  };

  const addOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();

    if (studentParticipants.length === 0) {
      setError("There are no participants to create poll.");
      return;
    }

    if (question.trim() === "") {
      setError("Question cannot be empty.");
      return;
    }

    if (options.some((opt) => opt.text.trim() === "")) {
      setError("All options must be filled.");
      return;
    }

    if (!options.some((opt) => opt.isCorrect)) {
      setError("Please mark one option as correct.");
      return;
    }

    setError(null);

    const pollOptions = options.map((opt) => ({
      text: opt.text,
      isCorrect: opt.isCorrect,
    }));
    socket.emit("create-poll", {
      question,
      options: pollOptions,
      duration,
      roomId,
    });
  };

  return (
    <form onSubmit={handleCreatePoll} className={styles.pollForm}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.textAreaContainer}>
        <div className={styles.questionContainer}>
          <label htmlFor="question" className="heading2">
            Enter your question ({question.length}/100)
          </label>
          <InputBar
            id="question"
            type="textarea"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setError(null);
            }}
            placeholder="What is the capital of France?"
            maxLength={100}
            className={styles.questionInput}
          />
        </div>

        <div className={styles.durationContainer}>
          <label htmlFor="duration" className="heading2">
            Poll Duration (seconds)
          </label>
          <InputBar
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => {
              setDuration(parseInt(e.target.value, 10));
              setError(null);
            }}
            min="10"
            max="300"
          />
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.optionsContainer}>
          <div className={styles.optionsHeader}>
            <h2 className="heading2">Edit Options</h2>
            <h2 className="heading2">Is it Correct?</h2>
          </div>

          {options.map((option, index) => (
            <div key={index} className={styles.optionItem}>
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <span className={styles.optionNumber}>{index + 1}</span>
                <InputBar
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
              </div>
              <div className={styles.correctnessToggle}>
                <input
                  type="radio"
                  name="correct-option"
                  checked={option.isCorrect}
                  onChange={() => {
                    handleCorrectnessChange(index);
                    setError(null);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className={styles.participantsListContainer}>
          <ParticipantsList roomId={roomId} />
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <Button type="button" variant="secondary" onClick={addOption}>
          + Add More option
        </Button>

        <Button
          type="submit"
          variant={
            error ||
            options.length === 0 ||
            studentParticipants.length === 0
              ? "danger"
              : "primary"
          }
          disabled={
            !!error ||
            options.length === 0 ||
            studentParticipants.length === 0
          }
        >
          Ask Question
        </Button>
      </div>
    </form>
  );
};

export default PollForm;
