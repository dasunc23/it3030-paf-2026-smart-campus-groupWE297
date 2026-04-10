import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TicketList } from './pages/TicketList';
import { CreateTicket } from './pages/ReportIssue';
import { TicketDetails } from './pages/TicketDetails';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<TicketList />} />
          <Route path="/report" element={<CreateTicket />} />
          <Route path="/ticket/:id" element={<TicketDetails />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;