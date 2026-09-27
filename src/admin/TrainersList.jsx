import { useState, useEffect } from "react";
import { Table, Button, Form, Row, Col, Container } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../services/api";
import TrainerForm from "./TrainerForm";

function TrainersList() {
  const [trainers, setTrainers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("name");

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const getTrainers = async (search = "", by = "name") => {
    try {
      const response = await api.get("/api/admin/trainers", { params: { search, by } });
      setTrainers(response.data);
    } catch {
      toast.error("Could not load trainers.");
    }
  };

  useEffect(() => {
    api.get("/api/admin/trainers")
      .then((response) => setTrainers(response.data))
      .catch(() => toast.error("Could not load trainers."));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    getTrainers(searchText, searchBy);
  };

  const handleClearSearch = () => {
    setSearchText("");
    getTrainers();
  };

  const handleAddClick = () => {
    setFormMode("add");
    setSelectedTrainer(null);
    setShowForm(true);
  };

  const handleEditClick = (trainer) => {
    setFormMode("edit");
    setSelectedTrainer(trainer);
    setShowForm(true);
  };

  const handleDelete = async (id, fullName) => {
    if (!window.confirm(`Are you sure you want to delete ${fullName}?`)) return;

    try {
      await api.delete(`/api/admin/trainers/${id}`);
      toast.success("Trainer deleted.");
      getTrainers(searchText, searchBy);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete trainer.");
    }
  };

  const handleSave = async (payload) => {
    try {
      if (formMode === "add") {
        await api.post("/api/admin/trainers", payload);
        toast.success("Trainer added.");
      } else {
        await api.put(`/api/admin/trainers/${selectedTrainer.id}`, payload);
        toast.success("Trainer updated.");
      }
      setShowForm(false);
      getTrainers(searchText, searchBy);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save trainer.");
    }
  };

  return (
    <Container className="mt-4">
      <h3>Personal Trainers</h3>

      <Row className="mb-3 align-items-end">
        <Col md={5}>
          <Form onSubmit={handleSearch} className="d-flex gap-2">
            <Form.Select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              style={{ maxWidth: 160 }}
            >
              <option value="staffNumber">Staff Number</option>
              <option value="name">Name</option>
              <option value="surname">Surname</option>
            </Form.Select>
            <Form.Control
              type="text"
              placeholder="Search trainers..."
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
            Add Trainer
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Staff No.</th>
            <th>Name</th>
            <th>Surname</th>
            <th>Gender</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Specialization</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trainers.length > 0 ? (
            trainers.map((trainer, index) => (
              <tr key={trainer.id}>
                <td>{index + 1}</td>
                <td>{trainer.staffNumber}</td>
                <td>{trainer.name}</td>
                <td>{trainer.surname}</td>
                <td>{trainer.gender}</td>
                <td>{trainer.email}</td>
                <td>{trainer.phoneNumber}</td>
                <td>{trainer.specialization}</td>
                <td>
                  <Button
                    size="sm"
                    variant="info"
                    className="me-2"
                    onClick={() => handleEditClick(trainer)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(trainer.id, `${trainer.name} ${trainer.surname}`)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center">
                No trainers found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <TrainerForm
        key={`${formMode}-${selectedTrainer?.id || "new"}-${showForm}`}
        show={showForm}
        mode={formMode}
        initialData={selectedTrainer}
        onHide={() => setShowForm(false)}
        onSave={handleSave}
      />
    </Container>
  );
}

export default TrainersList;
