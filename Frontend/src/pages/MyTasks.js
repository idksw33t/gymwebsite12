import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Table, Form, Alert, Spinner, Button } from "react-bootstrap";
// TODO: uncomment once the shared api.js arrives from the Login branch
// import api from "../../services/api";

const sampleTasks = [
  { id: 1, exerciseName: "Bench press", description: "Flat bench, controlled", sets: 4, repetitions: 10, dueDate: "2026-10-05", status: "NotStarted", workoutPlanId: 1, workoutPlanName: "Upper body" },
  { id: 2, exerciseName: "Squats", description: "Barbell, full depth", sets: 4, repetitions: 8, dueDate: "2026-10-06", status: "InProgress", workoutPlanId: 2, workoutPlanName: "Leg day" },
  { id: 3, exerciseName: "Treadmill run", description: "Steady pace", sets: 1, repetitions: 0, dueDate: "2026-10-07", status: "Complete", workoutPlanId: 3, workoutPlanName: "Cardio" },
  { id: 4, exerciseName: "Plank", description: "Hold with good form", sets: 3, repetitions: 0, dueDate: "2026-10-08", status: "NotStarted", workoutPlanId: 4, workoutPlanName: "Core" },
  { id: 5, exerciseName: "Lunges", description: "Walking lunges", sets: 3, repetitions: 12, dueDate: "2026-10-09", status: "InProgress", workoutPlanId: 2, workoutPlanName: "Leg day" },
];

function MyTasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const planId = searchParams.get("planId");

  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [usingSample, setUsingSample] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // TODO: replace the next line with: const res = await api.get("/member/tasks");
        throw new Error("api.js not connected yet");
        // setTasks(res.data);
      } catch (err) {
        setTasks(sampleTasks);
        setUsingSample(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleStatusChange(taskId, newStatus) {
    setError("");
    const previous = tasks;

    // Update the screen straight away
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

    // Sample data has no server to save to
    if (usingSample) return;

    try {
      // TODO: uncomment once api.js is connected
      // await api.put(`/member/tasks/${taskId}/status`, { status: newStatus });
    } catch (err) {
      // Put the old status back if the server refused
      setTasks(previous);
      const message =
        (err.response && err.response.data && err.response.data.message) ||
        "Could not update the task status. Please try again.";
      setError(message);
    }
  }

  const visibleTasks = tasks
    .filter((t) => filter === "All" || t.status === filter)
    .filter((t) => !planId || t.workoutPlanId === Number(planId));

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
        <Alert variant="info">
          Showing sample data. Status changes are not saved until the live tasks are connected.
        </Alert>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {planId && (
        <Alert variant="secondary">
          Showing tasks for one plan only.{" "}
          <Button variant="link" className="p-0 align-baseline" onClick={() => setSearchParams({})}>
            Show all tasks
          </Button>
        </Alert>
      )}

      <h3>My Workout Tasks</h3>

      <Form.Group className="mt-3 mb-3" style={{ maxWidth: "250px" }}>
        <Form.Label><strong>Filter by status:</strong></Form.Label>
        <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="NotStarted">Not Started</option>
          <option value="InProgress">In Progress</option>
          <option value="Complete">Complete</option>
        </Form.Select>
      </Form.Group>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Plan</th>
            <th>Description</th>
            <th>Sets</th>
            <th>Reps</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {visibleTasks.map((task) => (
            <tr key={task.id}>
              <td>{task.exerciseName}</td>
              <td>{task.workoutPlanName}</td>
              <td>{task.description}</td>
              <td>{task.sets}</td>
              <td>{task.repetitions}</td>
              <td>{task.dueDate}</td>
              <td>
                <Form.Select
                  size="sm"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  <option value="NotStarted">Not Started</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Complete">Complete</option>
                </Form.Select>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {visibleTasks.length === 0 && <p className="text-muted">No tasks for this filter.</p>}
    </Container>
  );
}

export default MyTasks;