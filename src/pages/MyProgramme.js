import React from "react";
import { Container, Card, Table } from "react-bootstrap";

const sampleProgramme = {
  name: "12-Week Muscle Builder",
  description: "A structured plan to build lean muscle over 12 weeks.",
  durationWeeks: 12,
  fitnessGoal: "Muscle Building",
  trainerName: "Coach Sipho",
  trainerSpecialization: "Weight Training",
  plans: [
    { name: "Upper body", taskCount: 6 },
    { name: "Leg day", taskCount: 5 },
    { name: "Cardio", taskCount: 4 },
  ],
};

function MyProgramme() {
  const data = sampleProgramme;

  return (
    <Container className="mt-4">
      <h3>My Training Programme</h3>

      <Card className="mb-4 mt-3">
        <Card.Header className="card-header-brand">Programme details</Card.Header>
        <Card.Body>
          <p><strong>Programme name:</strong> {data.name}</p>
          <p><strong>Description:</strong> {data.description}</p>
          <p><strong>Duration:</strong> {data.durationWeeks} weeks</p>
          <p><strong>Fitness goal:</strong> {data.fitnessGoal}</p>
          <p><strong>My personal trainer:</strong> {data.trainerName} ({data.trainerSpecialization})</p>
        </Card.Body>
      </Card>

      <h5>Workout plans in this programme</h5>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Plan name</th>
            <th>Tasks</th>
          </tr>
        </thead>
        <tbody>
          {data.plans.map((plan, index) => (
            <tr key={index}>
              <td>{plan.name}</td>
              <td>{plan.taskCount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default MyProgramme;