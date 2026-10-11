import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/trainer/dashboard'), api.get('/trainer/members')])
      .then(([statsRes, membersRes]) => {
        setStats(statsRes.data);
        setMembers(membersRes.data);
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Could not load your dashboard.')
      );
  }, []);

  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!stats) return <Container className="mt-4 text-center"><Spinner animation="border" /></Container>;

  return (
    <Container className="mt-4">
      <h2>Trainer Dashboard</h2>
      <p className="text-muted">Welcome back, {stats.trainerName}</p>
      <p className="text-muted">
        Staff number: {stats.staffNumber} | Specialization: {stats.specialization}
      </p>

      <Row className="mt-4">
        <Col md={4} className="mb-3">
          <Card className="text-center h-100 border-danger">
            <Card.Body>
              <Card.Subtitle className="text-danger text-uppercase small fw-bold">My Members</Card.Subtitle>
              <h1 className="display-4">{stats.memberCount}</h1>
              <Button variant="danger" className="mt-3" onClick={() => navigate('/trainer/members')}>
                View Members
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="text-center h-100 border-danger">
            <Card.Body>
              <Card.Subtitle className="text-danger text-uppercase small fw-bold">Workout Plans</Card.Subtitle>
              <h1 className="display-4 text-danger">{stats.planCount}</h1>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card className="text-center h-100 border-danger">
            <Card.Body>
              <Card.Subtitle className="text-danger text-uppercase small fw-bold">Tasks Due This Week</Card.Subtitle>
              <h1 className="display-4">{stats.tasksDueThisWeek}</h1>
              <p className="text-muted small mt-3 mb-0">Not yet complete</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h4 className="mt-4 text-danger">My Members</h4>
      <Table striped bordered hover className="mt-3">
        <thead className="table-danger">
          <tr>
            <th>Member no.</th>
            <th>Name</th>
            <th>Surname</th>
            <th>Programme</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.length > 0 ? (
            members.map((m) => (
              <tr key={m.id}>
                <td>{m.memberNumber}</td>
                <td>{m.name}</td>
                <td>{m.surname}</td>
                <td>{m.trainingProgrammeName || 'Not assigned'}</td>
                <td>
                  <Button size="sm" variant="danger" onClick={() => navigate(`/trainer/members/${m.id}/plans`)}>
                    Plans
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" className="text-center">No members assigned.</td></tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default TrainerDashboard;
