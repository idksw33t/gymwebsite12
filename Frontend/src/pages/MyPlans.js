import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner } from "react-bootstrap";
// TODO: uncomment once the shared api.js arrives from the Login branch
// import api from "../../services/api";

const samplePlans = [
  { id: 1, name: "Upper body", trainingProgrammeName: "12-Week Muscle Builder", taskCount: 6, completedCount: 2 },
  { id: 2, name: "Leg day", trainingProgrammeName: "12-Week Muscle Builder", taskCount: 5, completedCount: 1 },
  { id: 3, name: "Cardio", trainingProgrammeName: "12-Week Muscle Builder", taskCount: 4, completedCount: 0 },
  { id: 4, name: "Core", trainingProgrammeName: "12-Week Muscle Builder", taskCount: 3, completedCount: 3 },
];

function MyPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingSample, setUsingSample] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // TODO: replace the next line with: const res = await api.get("/member/plans");
        throw new Error("api.js not connected yet");
        // setPlans(res.data);
      } catch (err) {
        setPlans(samplePlans);
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
        <Alert variant="info">Showing sample data. Your live plans aren't connected yet.</Alert>
      )}

      <h3>My Workout Plans</h3>

      {plans.length === 0 ? (
        <Alert variant="secondary" className="mt-3">
          You don't have any workout plans yet. Your trainer will add them.
        </Alert>
      ) : (
        <Row className="mt-3">
          {plans.map((plan) => (
            <Col md={6} className="mb-4" key={plan.id}>
              <Card>
                <Card.Header className="card-header-brand">{plan.name}</Card.Header>
                <Card.Body>
                  <Card.Text className="text-muted">{plan.trainingProgrammeName}</Card.Text>
                  <p>{plan.taskCount} tasks | {plan.completedCount} complete</p>
                  <Button className="btn-brand">View tasks</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default MyPlans;