import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import TeacherPage from "./pages/Teacher/TeacherPage";
import StudentPage from "./pages/Student/StudentPage";
import PollResultsPage from "./pages/PollResults/PollResults";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/teacher" element={<TeacherPage />} />
      <Route path="/student" element={<StudentPage />} />
      <Route path="/results" element={<PollResultsPage />} />
    </Routes>
  );
}

export default App;
