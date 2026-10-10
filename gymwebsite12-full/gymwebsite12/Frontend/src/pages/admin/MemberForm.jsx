import { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

// Reusable modal form used by MembersList.jsx for both "Add Member" and "Edit Member".
// mode: "add" | "edit"
// initialData: member object to edit, or null when adding
function MemberForm({ show, mode, initialData, onHide, onSave }) {
  const [memberNumber, setMemberNumber] = useState(initialData?.memberNumber || "");
  const [name, setName] = useState(initialData?.name || "");
  const [surname, setSurname] = useState(initialData?.surname || "");
  const [gender, setGender] = useState(initialData?.gender || "Male");
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth?.substring(0, 10) || "");
  const [homeAddress, setHomeAddress] = useState(initialData?.homeAddress || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || "");
  const [membershipType, setMembershipType] = useState(initialData?.membershipType || "Monthly");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const clearForm = () => {
    setMemberNumber("");
    setName("");
    setSurname("");
    setGender("Male");
    setDateOfBirth("");
    setHomeAddress("");
    setEmail("");
    setPhoneNumber("");
    setMembershipType("Monthly");
    setPassword("");
  };

  // Simple required-field validation before we submit
  const validate = () => {
    const newErrors = {};
    if (!memberNumber.trim()) newErrors.memberNumber = "Member number is required.";
    if (!name.trim()) newErrors.name = "Name is required.";
    if (!surname.trim()) newErrors.surname = "Surname is required.";
    if (!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
    if (!homeAddress.trim()) newErrors.homeAddress = "Home address is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email address.";
    if (mode === "add" && password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      memberNumber,
      name,
      surname,
      gender,
      dateOfBirth,
      homeAddress,
      email,
      phoneNumber: phoneNumber || null,
      membershipType,
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
        <Modal.Title>{mode === "add" ? "Add Member" : "Edit Member"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-2">
            <Col>
              <Form.Label>Member Number</Form.Label>
              <Form.Control
                type="text"
                value={memberNumber}
                onChange={(e) => setMemberNumber(e.target.value)}
                isInvalid={!!errors.memberNumber}
              />
              <Form.Control.Feedback type="invalid">{errors.memberNumber}</Form.Control.Feedback>
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
                  name="gender"
                  checked={gender === g}
                  onChange={() => setGender(g)}
                />
              ))}
            </Col>
          </Row>

          <Row className="mb-2">
            <Col>
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                isInvalid={!!errors.dateOfBirth}
              />
              <Form.Control.Feedback type="invalid">{errors.dateOfBirth}</Form.Control.Feedback>
            </Col>
            <Col>
              <Form.Label>Membership Type</Form.Label>
              <Form.Select value={membershipType} onChange={(e) => setMembershipType(e.target.value)}>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-2">
            <Col>
              <Form.Label>Home Address</Form.Label>
              <Form.Control
                type="text"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                isInvalid={!!errors.homeAddress}
              />
              <Form.Control.Feedback type="invalid">{errors.homeAddress}</Form.Control.Feedback>
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
              <Form.Label>Phone Number (optional)</Form.Label>
              <Form.Control
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </Col>
          </Row>

          {mode === "add" && (
            <Row className="mb-2">
              <Col>
                <Form.Label>Password (for the member's login)</Form.Label>
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

export default MemberForm;
