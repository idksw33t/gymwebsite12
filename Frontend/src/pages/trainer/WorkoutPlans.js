import React, { useState, useEffect, Fragment } from 'react';
import { Container, Table, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

const planData = [
  { id: 1, name: "Upper body", description: "Upper body strength work", gymMemberId: 1, trainingProgrammeId: 3, trainingProgrammeName: "12-Week Muscle Builder", taskCount: 6, completedCount: 2 },
  { id: 2, name: "Leg day", description: "Lower body strength", gymMemberId: 1, trainingProgrammeId: 3, trainingProgrammeName: "12-Week Muscle Builder", taskCount: 5, completedCount: 1 },
  { id: 3, name: "Cardio", description: "Endurance focus", gymMemberId: 1, trainingProgrammeId: 3, trainingProgrammeName: "12-Week Muscle Builder", taskCount: 4, completedCount: 0 }

];

const WorkoutPlans = () =>{
    const { memberId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newPlan, setNewPlan] = useState({  name: '',description: '',trainingProgrammeId: 1});
  const [success, setSuccess] = useState('');

  useEffect (() =>{
    setData(planData)
  },[]);

  const handleCreate = () =>{
    if (!newPlan.name.trim()) return;
    setSuccess('Plan created successfully.');
    setShowForm(false);
    setNewPlan({ name: '', description: '', trainingProgrammeId: 3 });
    setTimeout(() => setSuccess(''), 3000);
  };

  return(
    <Fragment>
        <Container className='mt-4'>
            <h2 className="text-danger">Workout plans for Member #{memberId}</h2>
            <p className="text-muted">Programme: 12-Week Muscle Builder</p>

            {success && <Alert variant="danger">{success}</Alert>}
            
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Plan Name</th>
                        <th>Programme</th>
                        <th>Tasks</th>
                        <th>Progress</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((item, index) => (
                            <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.trainingProgrammeName}</td>
                            <td>{item.taskCount}</td>
                            <td>{item.completedCount} / {item.taskCount}</td>
                            <td>
                                <Button
                                    size="sm"
                                    variant='danger'
                                    onClick={() => navigate(`/trainer/plans/${item.id}/tasks`)}>
                                    View Tasks
                                </Button>
                                <Button size="sm" variant="outline-danger">
                                    Edit
                                </Button>
                            </td>
                            </tr>
                        ))
                    ):(
                        <tr>
                            <td colSpan="5" className="text-center">No plans yet.</td>
                        </tr>
                    )
                    }
                </tbody>
            </Table>
            <Button
                variant="danger"
                className="mt-3"
                onClick={() => setShowForm(!showForm)}>
                + Create workout plan
            </Button>

            {showForm &&(
                <div className="mt-3 p-3 border border-danger rounded bg-white">
                    <h5 className="text-danger">Create workout plan</h5>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Plan name *</Form.Label>
                                <Form.Control
                                placeholder="e.g. Upper body"
                                value={newPlan.name}
                                onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}/>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Programme *</Form.Label>
                                <Form.Select
                                    value={newPlan.trainingProgrammeId}
                                    onChange={e => setNewPlan({ ...newPlan, trainingProgrammeId: +e.target.value })}>
                                    <option value={3}>12-Week Muscle Builder</option>
                                    <option value={4}>Fat Loss Starter</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Description *</Form.Label>
                        <Form.Control
                        as="textarea"
                        placeholder="What this plan covers"
                        value={newPlan.description}
                        onChange={e => setNewPlan({ ...newPlan, description: e.target.value })}/>
                    </Form.Group>
                     <Button variant="danger" onClick={handleCreate}>Create plan</Button>
                    <Button variant="secondary" className="ms-2" onClick={() => setShowForm(false)}>
                        Cancel
                     </Button>
                </div>
            )}
        </Container>
    </Fragment>
  );
};

export default WorkoutPlans;
