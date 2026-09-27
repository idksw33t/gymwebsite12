import { useState, useEffect } from "react";
import { Table, Button, Form, Row, Col, Container } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../services/api";
import MemberForm from "./MemberForm";

function MembersList() {
  const [members, setMembers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("name");

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedMember, setSelectedMember] = useState(null);

  const getMembers = async (search = "", by = "name") => {
    try {
      const response = await api.get("/api/admin/members", { params: { search, by } });
      setMembers(response.data);
    } catch {
      toast.error("Could not load members.");
    }
  };

  useEffect(() => {
    api.get("/api/admin/members")
      .then((response) => setMembers(response.data))
      .catch(() => toast.error("Could not load members."));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    getMembers(searchText, searchBy);
  };

  const handleClearSearch = () => {
    setSearchText("");
    getMembers();
  };

  const handleAddClick = () => {
    setFormMode("add");
    setSelectedMember(null);
    setShowForm(true);
  };

  const handleEditClick = (member) => {
    setFormMode("edit");
    setSelectedMember(member);
    setShowForm(true);
  };

  const handleDelete = async (id, fullName) => {
    if (!window.confirm(`Are you sure you want to delete ${fullName}?`)) return;

    try {
      await api.delete(`/api/admin/members/${id}`);
      toast.success("Member deleted.");
      getMembers(searchText, searchBy);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete member.");
    }
  };

  const handleSave = async (payload) => {
    try {
      if (formMode === "add") {
        await api.post("/api/admin/members", payload);
        toast.success("Member added.");
      } else {
        await api.put(`/api/admin/members/${selectedMember.id}`, payload);
        toast.success("Member updated.");
      }
      setShowForm(false);
      getMembers(searchText, searchBy);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save member.");
    }
  };

  return (
    <Container className="mt-4">
      <h3>Gym Members</h3>

      <Row className="mb-3 align-items-end">
        <Col md={5}>
          <Form onSubmit={handleSearch} className="d-flex gap-2">
            <Form.Select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              style={{ maxWidth: 160 }}
            >
              <option value="memberNumber">Member Number</option>
              <option value="name">Name</option>
              <option value="surname">Surname</option>
            </Form.Select>
            <Form.Control
              type="text"
              placeholder="Search members..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button type="submit" variant="primary">
              Search
            </Button>
            <Button type="button" variant="outline-secondary" onClick={handleClearSearch}>
              Clear
            </Button>
          </Form>
        </Col>
        <Col md={7} className="text-end">
          <Button variant="success" onClick={handleAddClick}>
            Add Member
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Member No.</th>
            <th>Name</th>
            <th>Surname</th>
            <th>Gender</th>
            <th>Membership</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Trainer</th>
            <th>Programme</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.length > 0 ? (
            members.map((member, index) => (
              <tr key={member.id}>
                <td>{index + 1}</td>
                <td>{member.memberNumber}</td>
                <td>{member.name}</td>
                <td>{member.surname}</td>
                <td>{member.gender}</td>
                <td>{member.membershipType}</td>
                <td>{member.email}</td>
                <td>{member.phoneNumber || "-"}</td>
                <td>{member.personalTrainerName || "Unassigned"}</td>
                <td>{member.trainingProgrammeName || "Unassigned"}</td>
                <td>
                  <Button
                    size="sm"
                    variant="info"
                    className="me-2"
                    onClick={() => handleEditClick(member)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(member.id, `${member.name} ${member.surname}`)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="text-center">
                No members found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <MemberForm
        key={`${formMode}-${selectedMember?.id || "new"}-${showForm}`}
        show={showForm}
        mode={formMode}
        initialData={selectedMember}
        onHide={() => setShowForm(false)}
        onSave={handleSave}
      />
    </Container>
  );
}

export default MembersList;
