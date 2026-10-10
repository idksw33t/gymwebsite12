import React, { useState, useEffect, Fragment } from 'react';
import { Container, Table, Button, Form, Row, Col, Badge, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const initialTasks = [
  { id: 1, exerciseName: "Bench press", description: "Flat barbell, warm up 2 sets", sets: 4, repetitions: 10, dueDate: "2026-10-05", status: "NotStarted", workoutPlanId: 1 },
  { id: 2, exerciseName: "Shoulder press", description: "Dumbbell, controlled tempo", sets: 3, repetitions: 12, dueDate: "2026-10-06", status: "InProgress", workoutPlanId: 1 },
  { id: 3, exerciseName: "Pull-ups", description: "Full range, add weight if easy", sets: 3, repetitions: 8, dueDate: "2026-10-07", status: "Complete", workoutPlanId: 1 }
];

const formatStatus = (status) => status.replace(/([A-Z])/g, ' $1').trim();

const statusVariant = (status) => {
  if (status === 'Complete') return 'success';
  if (status === 'InProgress') return 'warning';
  return 'secondary';
};

const emptyTask = { exerciseName: '', description: '', sets: 3, repetitions: 10, dueDate: '' };

const WorkoutTasks = () => {
  const { planId } = useParams();
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(emptyTask);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setData(initialTasks);
  }, [planId]);

  const openCreate = () => {
    setEditTask(null);
    setForm(emptyTask);
    setShowForm(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      exerciseName: task.exerciseName,
      description: task.description,
      sets: task.sets,
      repetitions: task.repetitions,
      dueDate: task.dueDate
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.exerciseName.trim() || !form.description.trim()) return;

    if (editTask) {
      setData(data.map(t => t.id === editTask.id ? { ...t, ...form } : t));
      setSuccess('Task updated.');
    } else {
      const nextId = data.length > 0 ? Math.max(...data.map(t => t.id)) + 1 : 1;
      const newTask = {
        id: nextId,
        ...form,
        status: 'NotStarted',
        workoutPlanId: Number(planId)
      };
      setData([...data, newTask]);
      setSuccess('Task created.');
    }

    setShowForm(false);
    setEditTask(null);
    setForm(emptyTask);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <Fragment>
      <Container className="mt-4">
        <h2 className="text-danger">Tasks in Plan #{planId}</h2>
        <p className="text-muted">Member: Laone Matlhola</p>

        {success && <Alert variant="danger">{success}</Alert>}

        <Table striped bordered hover className="mt-3">
          <thead className="table-danger">
            <tr>
              <th>ID</th>
              <th>Exercise</th>
              <th>Sets</th>
              <th>Reps</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.exerciseName}</td>
                  <td>{item.sets}</td>
                  <td>{item.repetitions}</td>
                  <td>{item.dueDate}</td>
                  <td>
                    <Badge bg={statusVariant(item.status)}>
                      {formatStatus(item.status)}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" variant="danger" onClick={() => openEdit(item)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">No tasks yet.</td>
              </tr>
            )}
          </tbody>
        </Table>

        <Button variant="danger" className="mt-3" onClick={openCreate}>
          + Add workout task
        </Button>

        {showForm && (
          <div className="mt-3 p-3 border border-danger rounded bg-white">
            <h5 className="text-danger">
              {editTask ? 'Edit workout task' : 'Add workout task'}
            </h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Exercise name *</Form.Label>
                  <Form.Control
                    placeholder="e.g. Bench press"
                    value={form.exerciseName}
                    onChange={e => setForm({ ...form, exerciseName: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Due / workout date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="How to do it"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sets *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={form.sets}
                    onChange={e => setForm({ ...form, sets: +e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Repetitions *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={form.repetitions}
                    onChange={e => setForm({ ...form, repetitions: +e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button variant="danger" onClick={handleSubmit}>
              {editTask ? 'Save' : 'Create'}
            </Button>
            <Button variant="secondary" className="ms-2" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        )}
      </Container>
    </Fragment>
  );
};

export default WorkoutTasks;