import React, { useState, useEffect, Fragment } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const memberData = [
  {id: 1, memberNumber: "M0101", name: "Laone", surname: "Matlhola", trainingProgrammeName: "12-Week Muscle Builder" },
  { id: 2, memberNumber: "M0102", name: "John", surname: "Smith", trainingProgrammeName: "Fat Loss Starter" },
  { id: 4, memberNumber: "M0104", name: "Sarah", surname: "Jones", trainingProgrammeName: "Endurance Base" },
  { id: 7, memberNumber: "M0107", name: "Peter", surname: "Brown", trainingProgrammeName: null }
];
    
    


const MyMembers = () => {
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setData(memberData);
    },[]);

    return(
        <Fragment>
            <Container className="mt-4">
                <h2 className="text-danger">My Assigned Members</h2>

                <Table striped bordered hover className="mt-3">
                    <thead className='table-danger'>
                        <tr>
                            <th>#</th>
                            <th>Member #</th>
                            <th>Name</th>
                            <th>Surname</th>
                            <th>Email</th>
                            <th>Membership</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            data && data.length > 0 ?(
                                data.map((item, index) => (
                                    <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>{item.memberNumber}</td>
                                    <td>{item.name}</td>
                                    <td>{item.surname}</td>
                                    <td>{item.membershipType}</td>
                                    <td>{item.trainingProgrammeName || 'Not assigned'}</td>
                                    <td>
                                        <Button
                                            size =" sm"
                                            variant='danger'
                                            onClick={() => navigate(`/trainer/members/${item.id}/plans`)}>
                                            View Plans

                                        </Button>
                                    </td>
                                    </tr>
                                ))
                            ) :(
                                <tr>
                                    <td colSpan="7" className="text-center">No members found.</td>
                                </tr>
                            )
                        }
                    </tbody>
                </Table>
            </Container>
        </Fragment>
    );
};

export default MyMembers;