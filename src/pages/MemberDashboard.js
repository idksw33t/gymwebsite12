import React from "react";
import { Container, Row, Col, Card, Table, Badge, Button } from "react-bootstrap";

const sampleData = {
  memberName: "Kamo Mpoko",
  memberNumber: "M0001",
  membershipType: "Monthly",
  programmeName: "12-Week Muscle Builder",
  fitnessGoal: "Muscle Building",
  trainerName: "Coach Sipho",
  planCount: 3,
  notStartedCount: 4,
  inProgressCount: 2,
  completeCount: 5,
  upcomingTasks: [
    { exerciseName: "Bench press", workoutPlanName: "Upper body", dueDate: "2026-10-05", status: "NotStarted" },
    { exerciseName: "Squats", workoutPlanName: "Leg day", dueDate: "2026-10-06", status: "InProgress" },
    { exerciseName: "Treadmill run", workoutPlanName: "Cardio", dueDate: "2026-10-07", status: "NotStarted" },
  ],
};

function statusBadge(status) {
  if (status === "Complete") return <Badge bg="success">Complete</Badge>;
  if (status === "InProgress") return <Badge bg="warning" text="dark">In Progress</Badge>;
  return <Badge bg="secondary">Not Started</Badge>;
}

function MemberDashboard() {
  const data = sampleData;

  return (
    <Container className="mt-4">
      <h3>Welcome, {data.memberName}</h3>
      <p className="text-muted">
        Member number: {data.memberNumber} | Membership: {data.membershipType}
      </p>

      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Header className="card-header-brand">My Programme</Card.Header>
            <Card.Body>
              <Card.Title>{data.programmeName}</Card.Title>
              <Card.Text>Fitness goal: {data.fitnessGoal}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header className="card-header-brand">My Workout Plans</Card.Header>
            <Card.Body>
              <Card.Title>{data.planCount} plans</Card.Title>
              <Card.Text>Assigned by {data.trainerName}</Card.Text>
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
          {data.upcomingTasks.map((task, index) => (
            <tr key={index}>
              <td>{task.exerciseName}</td>
              <td>{task.workoutPlanName}</td>
              <td>{task.dueDate}</td>
              <td>{statusBadge(task.status)}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button className="btn-brand">View all tasks</Button>
    </Container>
  );
}

export default MemberDashboard;