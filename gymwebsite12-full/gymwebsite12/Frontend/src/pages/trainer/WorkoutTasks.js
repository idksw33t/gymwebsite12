import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Form, Row, Col, Badge, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const formatStatus = (status) => status.replace(/([A-Z])/g, ' $1').trim();

const statusVariant = (status) => {
  if (status === 'Complete') return 'success';
  if (status === 'InProgress') return 'warning';
  return 'secondary';
};

const emptyTask = { exerciseName: '', description: '', sets: 3, repetitions: 10, dueDate: '' };

const WorkoutTasks = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(emptyTask);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    const res = await api.get(`/trainer/plans/${planId}/tasks`);
    setData(res.data);
  }, [planId]);

  useEffect(() => {
    loadTasks().catch((err) =>
      setError(err.response?.data?.message || 'Could not load tasks.')
    );
  }, [loadTasks]);

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
      dueDate: (task.dueDate || '').slice(0, 10),
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.exerciseName.trim() || !form.description.trim() || !form.dueDate) {
      setError('Exercise name, description and date are required.');
      return;
    }
    if (form.sets < 1 || form.repetitions < 1) {
      setError('Sets and repetitions must be at least 1.');
      return;
    }
    const payload = {
      exerciseName: form.exerciseName.trim(),
      description: form.description.trim(),
      sets: Number(form.sets),
      repetitions: Number(form.repetitions),
      dueDate: form.dueDate,
    };
    try {
      if (editTask) {
        await api.put(`/trainer/tasks/${editTask.id}`, payload);
      } else {
        await api.post(`/trainer/plans/${planId}/tasks`, payload);
      }
      await loadTasks();
      setSuccess(editTask ? 'Task updated.' : 'Task created.');
      setShowForm(false);
      setEditTask(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the task.');
    }
  };

  const planName = data[0]?.workoutPlanName;

  return (
    <Container className="mt-4">
      <h2 className="text-danger">Tasks{planName ? ` in ${planName}` : ` in Plan #${planId}`}</h2>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover className="mt-3">
        <thead className="table-danger">
          <tr>
            <th>Exercise</th>
            <th>Sets</th>
            <th>Reps</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id}>
                <td>{item.exerciseName}</td>
                <td>{item.sets}</td>
                <td>{item.repetitions}</td>
                <td>{(item.dueDate || '').slice(0, 10)}</td>
                <td>
                  <Badge bg={statusVariant(item.status)}>{formatStatus(item.status)}</Badge>
                </td>
                <td>
                  <Button size="sm" variant="danger" onClick={() => openEdit(item)}>Edit</Button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" className="text-center">No tasks yet.</td></tr>
          )}
        </tbody>
      </Table>

      <Button variant="outline-danger" className="mt-3 me-2" onClick={() => navigate(-1)}>
        &larr; Back
      </Button>
      <Button variant="danger" className="mt-3" onClick={openCreate}>
        + Add workout task
      </Button>

      {showForm && (
        <div className="mt-3 p-3 border border-danger rounded bg-white">
          <h5 className="text-danger">{editTask ? 'Edit workout task' : 'Add workout task'}</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Exercise name *</Form.Label>
                <Form.Control
                  placeholder="e.g. Bench press"
                  value={form.exerciseName}
                  onChange={(e) => setForm({ ...form, exerciseName: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Due / workout date *</Form.Label>
                <Form.Control
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
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
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, sets: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, repetitions: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Button variant="danger" onClick={handleSubmit}>{editTask ? 'Save' : 'Create'}</Button>
          <Button variant="secondary" className="ms-2" onClick={() => setShowForm(false)}>Cancel</Button>
        </div>
      )}
    </Container>
  );
};

export default WorkoutTasks;
