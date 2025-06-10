import React, { useState } from "react";
import { socket } from "../../socket";
import Button from "../ui/Button/Button";
import styles from "./PollForm.module.css";
import InputBar from "../ui/InputBar/InputBar";

interface PollOption {
  text: string;
  isCorrect: boolean;
}

const PollForm: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<PollOption[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [duration, setDuration] = useState(60);

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleCorrectnessChange = (index: number, isCorrect: boolean) => {
    const newOptions = [...options];
    newOptions[index].isCorrect = isCorrect;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    const pollOptions = options.map((opt) => ({
      text: opt.text,
      isCorrect: opt.isCorrect,
    }));
    socket.emit("create-poll", { question, options: pollOptions, duration });
  };

  return (
    <form onSubmit={handleCreatePoll} className={styles.pollForm}>
      <div className={styles.textAreaContainer}>
        <div className={styles.questionContainer}>
          <label htmlFor="question">
            Enter your question ({question.length}/100)
          </label>
          <InputBar
            id="question"
            type="textarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What is the capital of France?"
            maxLength={100}
            className={styles.questionInput}
          />
        </div>

        <div className={styles.durationContainer}>
          <label htmlFor="duration">Poll Duration (seconds)</label>
          <InputBar
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            min="10"
            max="300"
          />
        </div>
      </div>

      <div className={styles.optionsContainer}>
        <div className={styles.optionsHeader}>
          <span>Edit Options</span>
          <span>Is it Correct?</span>
        </div>

        {options.map((option, index) => (
          <div key={index} className={styles.optionItem}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <span className={styles.optionNumber}>{index + 1}</span>
              <InputBar
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
            </div>
            <div className={styles.correctnessToggle}>
              <label>
                <input
                  type="radio"
                  name={`correct-option-${index}`}
                  checked={option.isCorrect === true}
                  onChange={() => handleCorrectnessChange(index, true)}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name={`correct-option-${index}`}
                  checked={option.isCorrect === false}
                  onChange={() => handleCorrectnessChange(index, false)}
                />{" "}
                No
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.buttonContainer}>
        <Button type="button" variant="secondary" onClick={addOption}>
          + Add More option
        </Button>

        <Button type="submit">Ask Question</Button>
      </div>
    </form>
  );
};

export default PollForm;
