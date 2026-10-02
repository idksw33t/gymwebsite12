import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const samplePlans = [
  { name: "Upper body", programme: "Muscle Building programme", taskCount: 6, completedCount: 2 },
  { name: "Leg day", programme: "Muscle Building programme", taskCount: 5, completedCount: 1 },
  { name: "Cardio", programme: "Muscle Building programme", taskCount: 4, completedCount: 0 },
  { name: "Core", programme: "Muscle Building programme", taskCount: 3, completedCount: 3 },
];

function MyPlans() {
  return (
    <Container className="mt-4">
      <h3>My Workout Plans</h3>
      <Row className="mt-3">
        {samplePlans.map((plan, index) => (
          <Col md={6} className="mb-4" key={index}>
            <Card>
              <Card.Header className="card-header-brand">{plan.name}</Card.Header>
              <Card.Body>
                <Card.Text className="text-muted">{plan.programme}</Card.Text>
                <p>{plan.taskCount} tasks | {plan.completedCount} complete</p>
                <p>Trainer: Coach Sipho</p>
                <Button className="btn-brand">View tasks</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default MyPlans;