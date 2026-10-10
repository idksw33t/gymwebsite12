import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MyMembers = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/trainer/members')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your members.'));
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="text-danger">My Assigned Members</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover className="mt-3">
        <thead className="table-danger">
          <tr>
            <th>#</th>
            <th>Member #</th>
            <th>Name</th>
            <th>Surname</th>
            <th>Email</th>
            <th>Membership</th>
            <th>Programme</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.memberNumber}</td>
                <td>{item.name}</td>
                <td>{item.surname}</td>
                <td>{item.email}</td>
                <td>{item.membershipType}</td>
                <td>{item.trainingProgrammeName || 'Not assigned'}</td>
                <td>
                  <Button size="sm" variant="danger" onClick={() => navigate(`/trainer/members/${item.id}/plans`)}>
                    View Plans
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="8" className="text-center">No members found.</td></tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default MyMembers;
