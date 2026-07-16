import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./Layout";
import Signup from "./components/Signup";
import Login from "./components/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />

      <Route path="/signup" element={<Signup />} />

      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<Layout />} />
    </Routes>
  );
}