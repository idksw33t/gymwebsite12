import { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

// Reusable modal form used by TrainersList.jsx for both "Add Trainer" and "Edit Trainer".
// mode: "add" | "edit"
function TrainerForm({ show, mode, initialData, onHide, onSave }) {
  const [staffNumber, setStaffNumber] = useState(initialData?.staffNumber || "");
  const [name, setName] = useState(initialData?.name || "");
  const [surname, setSurname] = useState(initialData?.surname || "");
  const [gender, setGender] = useState(initialData?.gender || "Male");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || "");
  const [specialization, setSpecialization] = useState(initialData?.specialization || "GeneralFitness");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const clearForm = () => {
    setStaffNumber("");
    setName("");
    setSurname("");
    setGender("Male");
    setEmail("");
    setPhoneNumber("");
    setSpecialization("GeneralFitness");
    setPassword("");
  };

  const validate = () => {
    const newErrors = {};
    if (!staffNumber.trim()) newErrors.staffNumber = "Staff number is required.";
    if (!name.trim()) newErrors.name = "Name is required.";
    if (!surname.trim()) newErrors.surname = "Surname is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email address.";
    if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required.";
    if (mode === "add" && password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      staffNumber,
      name,
      surname,
      gender,
      email,
      phoneNumber,
      specialization,
    };

    if (mode === "add") {
      payload.password = password;
    }

    onSave(payload);
    clearForm();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{mode === "add" ? "Add Trainer" : "Edit Trainer"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-2">
            <Col>
              <Form.Label>Staff Number</Form.Label>
              <Form.Control
                type="text"
                value={staffNumber}
                onChange={(e) => setStaffNumber(e.target.value)}
                isInvalid={!!errors.staffNumber}
              />
              <Form.Control.Feedback type="invalid">{errors.staffNumber}</Form.Control.Feedback>
            </Col>
          </Row>

          <Row className="mb-2">
            <Col>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Col>
            <Col>
              <Form.Label>Surname</Form.Label>
              <Form.Control
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                isInvalid={!!errors.surname}
              />
              <Form.Control.Feedback type="invalid">{errors.surname}</Form.Control.Feedback>
            </Col>
          </Row>

          <Row className="mb-2">
            <Col>
              <Form.Label className="d-block">Gender</Form.Label>
              {["Male", "Female", "Other"].map((g) => (
                <Form.Check
                  inline
                  key={g}
                  type="radio"
                  label={g}
                  name="trainerGender"
                  checked={gender === g}
                  onChange={() => setGender(g)}
                />
              ))}
            </Col>
            <Col>
              <Form.Label>Specialization</Form.Label>
              <Form.Select value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                <option value="WeightTraining">Weight Training</option>
                <option value="Cardio">Cardio</option>
                <option value="StrengthAndConditioning">Strength &amp; Conditioning</option>
                <option value="GeneralFitness">General Fitness</option>
                <option value="WeightLoss">Weight Loss</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-2">
            <Col>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!errors.email}
                disabled={mode === "edit"}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Col>
            <Col>
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                isInvalid={!!errors.phoneNumber}
              />
              <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
            </Col>
          </Row>

          {mode === "add" && (
            <Row className="mb-2">
              <Col>
                <Form.Label>Password (for the trainer's login)</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </Col>
            </Row>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TrainerForm;
