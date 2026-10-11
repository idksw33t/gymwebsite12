import { useState } from 'react';
import { Button, Container, Nav, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Assignments from './Assignments';
import MembersList from './MembersList';
import TrainersList from './TrainersList';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('members');
  const { displayName, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-page">
      <ToastContainer position="top-right" />

      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-brand">
            <div className="admin-logo">F</div>
            <div>
              <strong>Motion Studio</strong>
              <span>Administration</span>
            </div>
          </div>

          <div className="admin-user">
            <span className="admin-email">{displayName}</span>
            <Button variant="light" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
        </div>
      </header>

      <Container fluid="lg" className="py-4">
        <div className="admin-card">
          <Tab.Container activeKey={activeTab} onSelect={(key) => key && setActiveTab(key)}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item><Nav.Link eventKey="members">Members</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="trainers">Trainers</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="assignments">Assignments</Nav.Link></Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="members"><MembersList /></Tab.Pane>
              <Tab.Pane eventKey="trainers"><TrainersList /></Tab.Pane>
              <Tab.Pane eventKey="assignments"><Assignments active={activeTab === 'assignments'} /></Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </Container>
    </div>
  );
}

export default AdminDashboard;
