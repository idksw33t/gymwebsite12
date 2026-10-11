import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Alert, Spinner } from "react-bootstrap";
import api from "../services/api";

function MyPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/member/plans");
        setPlans(res.data);
      } catch (err) {
        setError(
          (err.response && err.response.data && err.response.data.message) ||
            "Could not load your plans. Please try again."
        );
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

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
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
                  <Button className="btn-brand" onClick={() => navigate(`/member/tasks?planId=${plan.id}`)}>
                    View tasks
                  </Button>
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