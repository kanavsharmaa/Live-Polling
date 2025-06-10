import React from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className,
  ...props
}) => {
  if(props.disabled) {
    variant = "danger";
  }
  return (
    <button className={`${className} ${styles.button} ${styles[variant]} `} {...props}>
      {children}
    </button>
  );
};

export default Button;
