import React from "react";
import styles from "./InputBar.module.css";

interface InputBarProps {
  id?: string;
  type?: string;
  value: string | number;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  maxLength?: number;
  min?: string;
  max?: string;
}

const InputBar: React.FC<InputBarProps> = ({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  maxLength,
  min,
  max,
}) => {
  if (type === "textarea") {
    return (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${styles.input} ${className}`}
        maxLength={maxLength}
      />
    );
  } else if (type === "string") {
    return (
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${styles.input} ${className}`}
        maxLength={maxLength}
      />
    );
  } else if (type === "number") {
    return (
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${styles.input} ${className}`}
        min={min}
        max={max}
      />
    );
  }
  
  // Default case for text input
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`${styles.input} ${className}`}
      maxLength={maxLength}
    />
  );
};

export default InputBar;
