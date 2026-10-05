import React, { useState, useEffect, Fragment } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const TrainerDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        memberCount: 0,
        planCount: 0,
        tasksDueThisWeek: 0
    });

    const [members, setMembers] = useState([]);
    useEffect(() => {
        setStats({memberCount: 12, planCount:20, tasksDueThisWeek:9 });

        setMembers([
            { id: 1, memberNumber: "M0101", name: "Laone", surname: "Matlhola", trainingProgrammeName: "12-Week Muscle Builder" },
            { id: 2, memberNumber: "M0102", name: "John", surname: "Smith", trainingProgrammeName: "Fat Loss Starter" },
            { id: 3, memberNumber: "M0104", name: "Sarah", surname: "Jones", trainingProgrammeName: "Endurance Base" }
        ])
    },[]);

    return(
        <Fragment>
            <Container className = "mt-4">
                <h2>Trainer DashBoard</h2>
                <p className="text-muted">Welcome Back, Lukhanyo</p>
                <p className="text-muted">
                    Staff number: S001 | Specialization: Cardio
                </p>

                <Row className="mt-4">
                    <Col md={4} className="mb-3">
                    <Card className="text-center h-100 border-danger">
                        <Card.Body>
                            <Card.Subtitle className='text-danger text-uppercase small fw-bold'>My Members</Card.Subtitle>
                            <h1 className="display-4">{stats.memberCount}</h1>
                             <Button
                                variant="danger"
                                className="mt-3"
                                onClick={() => navigate('/trainer/members')}>
                                View Members
                             </Button>

                        </Card.Body>
                    </Card>
                    </Col>

                    <Col md={4} className="mb-3">
                        <Card className="text-center h-100 border-danger">
                            <Card.Body>
                                <Card.Subtitle className='text-danger text-uppercase small fw-bold'>Workout Plans</Card.Subtitle>
                                <h1 className="display-4 text-danger">{stats.planCount}</h1>
                                
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col  md={4} className="mb-3">
                        <Card className ="text-center h-100 border-danger">
                            <Card.Body>
                                <Card.Subtitle className='text-danger text-uppercase small fw-bold'>Tasks Due This Week</Card.Subtitle>
                                <h1 className="display-4">{stats.tasksDueThisWeek}</h1>
                                <p className="text-muted small mt-3 mb-0">
                                    Not yet complete
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>

                </Row>
                <h4 className="mt-4 text-danger">My Members</h4>
                <Table striped bordered hover className="mt-3">
                    <thead className="table-danger">
                         <tr>
                            <th>Member no.</th>
                            <th>Name</th>
                            <th>Surname</th>
                            <th>Programme</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members && members.length > 0?(
                            members.map(m => (
                                 <tr key={m.id}>
                                    <td>{m.memberNumber}</td>
                                    <td>{m.name}</td>
                                    <td>{m.surname}</td>
                                    <td>{m.trainingProgrammeName || 'Not assigned'}</td>
                                    <td>
                                        <Button 
                                        size="sm"
                                        variant="danger"
                                        onClick={() => navigate(`/trainer/members/${m.id}/plans`)}>
                                            Plans
                                        </Button>
                                    </td>
                                    </tr>
                            ))

                            ):(
                                <tr><td colSpan="5" className="text-center">No members assigned.</td>
                                </tr>
                            
                        )}
                    </tbody>
                </Table>
            </Container>
        </Fragment>
    )
};

export default TrainerDashboard;

 
