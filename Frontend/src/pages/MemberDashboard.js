import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Spinner } from "react-bootstrap";
// TODO: uncomment once the shared api.js arrives from the Login branch
// import api from "../../services/api";

const sampleData = {
  memberName: "Kamo Mpoko",
  memberNumber: "M0001",
  membershipType: "Monthly",
  programmeName: "12-Week Muscle Builder",
  fitnessGoal: "MuscleBuilding",
  trainerName: "Coach Sipho",
  planCount: 3,
  notStartedCount: 4,
  inProgressCount: 2,
  completeCount: 5,
  upcomingTasks: [
    { id: 1, exerciseName: "Bench press", workoutPlanName: "Upper body", dueDate: "2026-10-05", status: "NotStarted" },
    { id: 2, exerciseName: "Squats", workoutPlanName: "Leg day", dueDate: "2026-10-06", status: "InProgress" },
    { id: 3, exerciseName: "Treadmill run", workoutPlanName: "Cardio", dueDate: "2026-10-07", status: "NotStarted" },
  ],
};

// "MuscleBuilding" -> "Muscle Building"
function spaced(value) {
  return value ? value.replace(/([a-z])([A-Z])/g, "$1 $2") : "";
}

function statusBadge(status) {
  if (status === "Complete") return <Badge bg="success">Complete</Badge>;
  if (status === "InProgress") return <Badge bg="warning" text="dark">In Progress</Badge>;
  return <Badge bg="secondary">Not Started</Badge>;
}

function MemberDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingSample, setUsingSample] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // TODO: replace the next line with: const res = await api.get("/member/dashboard");
        throw new Error("api.js not connected yet");
        // setData(res.data);
      } catch (err) {
        setData(sampleData);
        setUsingSample(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Container className="mt-4">
        <Spinner animation="border" size="sm" /> Loading...
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {usingSample && (
        <Alert variant="info">Showing sample data. The live dashboard isn't connected yet.</Alert>
      )}

      <h3>Welcome, {data.memberName}</h3>
      <p className="text-muted">
        Member number: {data.memberNumber} | Membership: {data.membershipType}
      </p>

      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Header className="card-header-brand">My Programme</Card.Header>
            <Card.Body>
              {data.programmeName ? (
                <>
                  <Card.Title>{data.programmeName}</Card.Title>
                  <Card.Text>Fitness goal: {spaced(data.fitnessGoal)}</Card.Text>
                </>
              ) : (
                <Card.Text>No programme assigned yet.</Card.Text>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header className="card-header-brand">My Workout Plans</Card.Header>
            <Card.Body>
              <Card.Title>{data.planCount} plans</Card.Title>
              <Card.Text>
                {data.trainerName ? `Assigned by ${data.trainerName}` : "No trainer assigned yet."}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header className="card-header-brand">My Tasks</Card.Header>
            <Card.Body>
              <div>Not Started: {data.notStartedCount}</div>
              <div>In Progress: {data.inProgressCount}</div>
              <div>Complete: {data.completeCount}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h5>Upcoming tasks</h5>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Plan</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.upcomingTasks.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-muted">No upcoming tasks.</td>
            </tr>
          ) : (
            data.upcomingTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.exerciseName}</td>
                <td>{task.workoutPlanName}</td>
                <td>{task.dueDate}</td>
                <td>{statusBadge(task.status)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Button className="btn-brand" onClick={() => navigate("/tasks")}>View all tasks</Button>
    </Container>
  );
}

export default MemberDashboard;