import React, { useEffect, useState } from "react";
import { Container, Card, Table, Alert, Spinner } from "react-bootstrap";
// TODO: uncomment once the shared api.js arrives from the Login branch
// import api from "../../services/api";

const sampleProgramme = {
  id: 3,
  name: "12-Week Muscle Builder",
  description: "A structured plan to build lean muscle over 12 weeks.",
  durationWeeks: 12,
  fitnessGoal: "MuscleBuilding",
  trainerName: "Coach Sipho",
  trainerSpecialization: "WeightTraining",
  plans: [
    { id: 1, name: "Upper body", taskCount: 6 },
    { id: 2, name: "Leg day", taskCount: 5 },
    { id: 3, name: "Cardio", taskCount: 4 },
  ],
};

// "MuscleBuilding" -> "Muscle Building"
function spaced(value) {
  return value ? value.replace(/([a-z])([A-Z])/g, "$1 $2") : "";
}

function MyProgramme() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingSample, setUsingSample] = useState(false);
  const [notAssigned, setNotAssigned] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // TODO: replace the next line with: const res = await api.get("/member/programme");
        throw new Error("api.js not connected yet");
        // setData(res.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // The API says no programme is assigned yet
          setNotAssigned(true);
        } else {
          setData(sampleProgramme);
          setUsingSample(true);
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
      {usingSample && (
        <Alert variant="info">Showing sample data. The live programme isn't connected yet.</Alert>
      )}

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