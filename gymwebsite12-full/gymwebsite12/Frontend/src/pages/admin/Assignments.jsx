import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../../services/api";

// Lets an admin assign a personal trainer to a gym member,
// and assign a gym member to a training programme.
function Assignments({ active }) {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [programmes, setProgrammes] = useState([]);

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [selectedProgrammeId, setSelectedProgrammeId] = useState("");

  const loadData = async () => {
    try {
      const [membersRes, trainersRes, programmesRes] = await Promise.all([
        api.get("/admin/members"),
        api.get("/admin/trainers"),
        api.get("/admin/programmes"),
      ]);
      setMembers(membersRes.data);
      setTrainers(trainersRes.data);
      setProgrammes(programmesRes.data);
    } catch (error) {
      toast.error("Could not load assignment data.");
    }
  };

  useEffect(() => {
    if (!active) return;

    Promise.all([
      api.get("/admin/members"),
      api.get("/admin/trainers"),
      api.get("/admin/programmes"),
    ])
      .then(([membersRes, trainersRes, programmesRes]) => {
        setMembers(membersRes.data);
        setTrainers(trainersRes.data);
        setProgrammes(programmesRes.data);
      })
      .catch(() => toast.error("Could not load assignment data."));
  }, [active]);

  const handleAssignTrainer = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) {
      toast.error("Please select a member.");
      return;
    }
    try {
      await api.put(`/admin/members/${selectedMemberId}/trainer`, {
        personalTrainerId: selectedTrainerId ? Number(selectedTrainerId) : null,
      });
      toast.success(selectedTrainerId ? "Trainer assigned." : "Trainer removed from member.");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not assign trainer.");
    }
  };

  const handleAssignProgramme = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !selectedProgrammeId) {
      toast.error("Please select both a member and a training programme.");
      return;
    }
    try {
      await api.put(`/admin/members/${selectedMemberId}/programme`, {
        trainingProgrammeId: Number(selectedProgrammeId),
      });
      toast.success("Training programme assigned.");
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not assign training programme.");
    }
  };

  return (
    <Container className="mt-4">
      <h3>Assignments</h3>

      <Row className="g-4 mt-2">
        <Col md={6}>
          <h5>Assign Trainer to Member</h5>
          <Form onSubmit={handleAssignTrainer}>
            <Form.Group className="mb-2">
              <Form.Label>Gym Member</Form.Label>
              <Form.Select
                value={selectedMemberId}
                onChange={(e) => {
                  const memberId = e.target.value;
                  const member = members.find((item) => String(item.id) === memberId);
                  setSelectedMemberId(memberId);
                  setSelectedTrainerId(member?.personalTrainerId ? String(member.personalTrainerId) : "");
                }}
              >
                <option value="">-- Select a member --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.memberNumber} - {m.name} {m.surname}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Personal Trainer</Form.Label>
              <Form.Select
                value={selectedTrainerId}
                onChange={(e) => setSelectedTrainerId(e.target.value)}
              >
                <option value="">No trainer</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.staffNumber} - {t.name} {t.surname}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary">
              Update Trainer Assignment
            </Button>
          </Form>
        </Col>

        <Col md={6}>
          <h5>Assign Member to Training Programme</h5>
          <Form onSubmit={handleAssignProgramme}>
            <Form.Group className="mb-2">
              <Form.Label>Gym Member</Form.Label>
              <Form.Select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
              >
                <option value="">-- Select a member --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.memberNumber} - {m.name} {m.surname}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Training Programme</Form.Label>
              <Form.Select
                value={selectedProgrammeId}
                onChange={(e) => setSelectedProgrammeId(e.target.value)}
              >
                <option value="">-- Select a programme --</option>
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.durationWeeks} weeks)
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary">
              Assign Programme
            </Button>
          </Form>
        </Col>
      </Row>

      <h5 className="mt-5">Current Assignments</h5>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Member</th>
            <th>Trainer</th>
            <th>Programme</th>
          </tr>
        </thead>
        <tbody>
          {members.length > 0 ? (
            members.map((m) => (
              <tr key={m.id}>
                <td>
                  {m.memberNumber} - {m.name} {m.surname}
                </td>
                <td>{m.personalTrainerName || "Unassigned"}</td>
                <td>{m.trainingProgrammeName || "Unassigned"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No members found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default Assignments;
