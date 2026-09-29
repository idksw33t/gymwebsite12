import React, { useState } from "react";
import { Container, Table, Form, Badge } from "react-bootstrap";

const sampleTasks = [
  { id: 1, exerciseName: "Bench press", description: "Flat bench, controlled", sets: 4, repetitions: 10, dueDate: "2026-10-05", status: "NotStarted" },
  { id: 2, exerciseName: "Squats", description: "Barbell, full depth", sets: 4, repetitions: 8, dueDate: "2026-10-06", status: "InProgress" },
  { id: 3, exerciseName: "Treadmill run", description: "Steady pace", sets: 1, repetitions: 0, dueDate: "2026-10-07", status: "Complete" },
  { id: 4, exerciseName: "Plank", description: "Hold with good form", sets: 3, repetitions: 0, dueDate: "2026-10-08", status: "NotStarted" },
  { id: 5, exerciseName: "Lunges", description: "Walking lunges", sets: 3, repetitions: 12, dueDate: "2026-10-09", status: "InProgress" },
];

function statusBadge(status) {
  if (status === "Complete") return <Badge bg="success">Complete</Badge>;
  if (status === "InProgress") return <Badge bg="warning" text="dark">In Progress</Badge>;
  return <Badge bg="secondary">Not Started</Badge>;
}

function MyTasks() {
  const [tasks, setTasks] = useState(sampleTasks);
  const [filter, setFilter] = useState("All");

  function handleStatusChange(taskId, newStatus) {
    // Updates the task in local state. Later: also send a PUT request to the API here.
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  }

  const visibleTasks = filter === "All" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <Container className="mt-4">
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