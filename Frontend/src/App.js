import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import MemberDashboard from "./pages/MemberDashboard";
import MyProgramme from "./pages/MyProgramme";
import MyPlans from "./pages/MyPlans";
import MyTasks from "./pages/MyTasks";

import TrainerDashboard from './pages/trainer/TrainerDashboard';
import MyMembers from './pages/trainer/MyMembers';
import WorkoutPlans from './pages/trainer/WorkoutPlans';
import WorkoutTasks from './pages/trainer/WorkoutTasks';

function App() {
  return (
    <BrowserRouter>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<MemberDashboard />} />
        <Route path="/programme" element={<MyProgramme />} />
        <Route path="/plans" element={<MyPlans />} />
        <Route path="/tasks" element={<MyTasks />} />
        <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
        <Route path="/trainer/members" element={<MyMembers />} />
        <Route path="/trainer/members/:memberId/plans" element={<WorkoutPlans />} />
        <Route path="/trainer/plans/:planId/tasks" element={<WorkoutTasks />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;