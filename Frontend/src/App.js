import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import MemberDashboard from "./pages/MemberDashboard";
import MyProgramme from "./pages/MyProgramme";
import MyPlans from "./pages/MyPlans";
import MyTasks from "./pages/MyTasks";

function App() {
  return (
    <BrowserRouter>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<MemberDashboard />} />
        <Route path="/programme" element={<MyProgramme />} />
        <Route path="/plans" element={<MyPlans />} />
        <Route path="/tasks" element={<MyTasks />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;