import React, { useEffect, useState } from "react";
import { Container, Card, Table, Alert, Spinner } from "react-bootstrap";
import api from "../services/api";

// "MuscleBuilding" -> "Muscle Building"
function spaced(value) {
  return value ? value.replace(/([a-z])([A-Z])/g, "$1 $2") : "";
}

function MyProgramme() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notAssigned, setNotAssigned] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/member/programme");
        setData(res.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // The API says no programme is assigned yet
          setNotAssigned(true);
        } else {
          setError(
            (err.response && err.response.data && err.response.data.message) ||
              "Could not load your programme. Please try again."
          );
        }
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

  if (notAssigned) {
    return (
      <Container className="mt-4">
        <h3>My Training Programme</h3>
        <Alert variant="secondary" className="mt-3">
          No training programme has been assigned to you yet. Please ask the gym admin.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h3>My Training Programme</h3>

      <Card className="mb-4 mt-3">
        <Card.Header className="card-header-brand">Programme details</Card.Header>
        <Card.Body>
          <p><strong>Programme name:</strong> {data.name}</p>
          <p><strong>Description:</strong> {data.description}</p>
          <p><strong>Duration:</strong> {data.durationWeeks} weeks</p>
          <p><strong>Fitness goal:</strong> {spaced(data.fitnessGoal)}</p>
          <p>
            <strong>My personal trainer:</strong>{" "}
            {data.trainerName
              ? `${data.trainerName}${data.trainerSpecialization ? ` (${spaced(data.trainerSpecialization)})` : ""}`
              : "Not assigned yet"}
          </p>
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
          {data.plans.length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center text-muted">No workout plans yet.</td>
            </tr>
          ) : (
            data.plans.map((plan) => (
              <tr key={plan.id}>
                <td>{plan.name}</td>
                <td>{plan.taskCount}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default MyProgramme;