import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import Button from "../../components/ui/Button/Button";
import Tag from "../../components/ui/Tag/Tag";

const Home = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/${selectedRole}`);
    }
  };

  return (
    <div className={styles.landingPageContainer}>
      <Tag name="Intervue Poll" />
      <div className={styles.header}>
        <h1 className="heading1">Welcome to the Live Polling System</h1>
        <h5 className="subHeading3">
          Please select the role that best describes you to begin using the live
          polling system
        </h5>
      </div>
      <div className={styles.roleSelection}>
        <div
          className={`${styles.roleCard} ${
            selectedRole === "student" ? styles.selectedRoleCard : ""
          }`}
          onClick={() => setSelectedRole("student")}
        >
          <h3 className="heading2">I'm a Student</h3>
          <h5 className="heading3">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
            quos.
          </h5>
        </div>
        <div
          className={`${styles.roleCard} ${
            selectedRole === "teacher" ? styles.selectedRoleCard : ""
          }`}
          onClick={() => setSelectedRole("teacher")}
        >
          <h3 className="heading2">I'm a Teacher</h3>
          <h5 className="heading3">Submit answers and view live poll results in real-time</h5>
        </div>
      </div>
      <Button onClick={handleContinue} disabled={!selectedRole}>
        Continue
      </Button>
    </div>
  );
};

export default Home;
