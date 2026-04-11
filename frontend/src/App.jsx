import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { TicketList } from "./pages/TicketList";
import { CreateTicket } from "./pages/ReportIssue";
import { TicketDetails } from "./pages/TicketDetails";

import Home from "./pages/Home.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import TechnicianDashboard from "./pages/TechnicianDashboard";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ResourceCatalogue from "./pages/ResourceCatalogue.jsx";
import AuditLogs from "./pages/AuditLogs.jsx";
import CampusResources from "./pages/CampusResources.jsx";
import AddResourceForm from "./pages/AddResourceForm.jsx";
import Bookings from "./pages/Bookings.jsx";
import AdminBookings from "./pages/AdminBookings.jsx";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/tickets" element={<TicketList />} />
          <Route path="/tickets/new" element={<CreateTicket />} />
          <Route path="/tickets/my" element={<TicketList />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/technician" element={<TechnicianDashboard />} />

          <Route path="/auditlogs" element={<AuditLogs />} />
          <Route path="/campus-resources" element={<CampusResources />} />
          <Route path="/resources" element={<ResourceCatalogue />} />
          <Route path="/resources/add" element={<AddResourceForm />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/bookings/admin" element={<AdminBookings />} />
        </Routes>
    </Router>
  );
}

export default App;
