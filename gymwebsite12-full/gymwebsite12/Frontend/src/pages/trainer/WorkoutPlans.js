import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const emptyPlan = { name: '', description: '', trainingProgrammeId: '' };

const WorkoutPlans = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [data, setData] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState(emptyPlan);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadPlans = useCallback(async () => {
    const res = await api.get(`/trainer/members/${memberId}/plans`);
    setData(res.data);
  }, [memberId]);

  useEffect(() => {
    Promise.all([
      api.get('/trainer/members'),
      api.get('/trainer/programmes'),
      loadPlans(),
    ])
      .then(([membersRes, programmesRes]) => {
        setMember(membersRes.data.find((m) => String(m.id) === String(memberId)) || null);
        setProgrammes(programmesRes.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load workout plans.'));
  }, [memberId, loadPlans]);

  const openCreate = () => {
    setEditPlan(null);
    setForm({ ...emptyPlan, trainingProgrammeId: member?.trainingProgrammeId || programmes[0]?.id || '' });
    setShowForm(true);
  };

  const openEdit = (plan) => {
    setEditPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description || '',
      trainingProgrammeId: plan.trainingProgrammeId,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim() || !form.description.trim() || !form.trainingProgrammeId) {
      setError('Name, description and programme are required.');
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      trainingProgrammeId: Number(form.trainingProgrammeId),
    };
    try {
      if (editPlan) {
        await api.put(`/trainer/plans/${editPlan.id}`, payload);
      } else {
        await api.post(`/trainer/members/${memberId}/plans`, payload);
      }
      await loadPlans();
      setSuccess(editPlan ? 'Plan updated.' : 'Plan created successfully.');
      setShowForm(false);
      setEditPlan(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the plan.');
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-danger">
        Workout plans{member ? ` for ${member.name} ${member.surname}` : ''}
      </h2>
      <p className="text-muted">
        Programme: {member?.trainingProgrammeName || 'Not assigned'}
      </p>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover>
        <thead className="table-danger">
          <tr>
            <th>Plan Name</th>
            <th>Programme</th>
            <th>Tasks</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.trainingProgrammeName}</td>
                <td>{item.taskCount}</td>
                <td>{item.completedCount} / {item.taskCount}</td>
                <td>
                  <Button size="sm" variant="danger" className="me-2" onClick={() => navigate(`/trainer/plans/${item.id}/tasks`)}>
                    View Tasks
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => openEdit(item)}>
                    Edit
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" className="text-center">No plans yet.</td></tr>
          )}
        </tbody>
      </Table>

      <Button variant="outline-danger" className="mt-3 me-2" onClick={() => navigate('/trainer/members')}>
        &larr; Back to members
      </Button>
      <Button variant="danger" className="mt-3" onClick={openCreate}>
        + Create workout plan
      </Button>

      {showForm && (
        <div className="mt-3 p-3 border border-danger rounded bg-white">
          <h5 className="text-danger">{editPlan ? 'Edit workout plan' : 'Create workout plan'}</h5>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Plan name *</Form.Label>
                <Form.Control
                  placeholder="e.g. Upper body"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Programme *</Form.Label>
                <Form.Select
                  value={form.trainingProgrammeId}
                  onChange={(e) => setForm({ ...form, trainingProgrammeId: e.target.value })}
                >
                  <option value="">-- Select a programme --</option>
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description *</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="What this plan covers"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Form.Group>
          <Button variant="danger" onClick={handleSubmit}>{editPlan ? 'Save' : 'Create plan'}</Button>
          <Button variant="secondary" className="ms-2" onClick={() => setShowForm(false)}>Cancel</Button>
        </div>
      )}
    </Container>
  );
};

export default WorkoutPlans;
