import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Container, Table, Form, Alert, Spinner, Button } from "react-bootstrap";
import api from "../services/api";

function MyTasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const planId = searchParams.get("planId");

  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/member/tasks");
        setTasks(res.data);
      } catch (err) {
        setLoadError(
          (err.response && err.response.data && err.response.data.message) ||
            "Could not load your tasks. Please try again."
        );
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

    try {
      await api.put(`/member/tasks/${taskId}/status`, { status: newStatus });
    } catch (err) {
      // Put the old status back if the server refused
      setTasks(previous);
      setError(
        (err.response && err.response.data && err.response.data.message) ||
          "Could not update the task status. Please try again."
      );
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

  if (loadError) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{loadError}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
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