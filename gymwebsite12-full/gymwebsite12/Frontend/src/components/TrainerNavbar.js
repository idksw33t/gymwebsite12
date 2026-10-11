import React from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function TrainerNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { displayName, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Navbar className="navbar-brand-custom" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/trainer/dashboard">Motion Studio</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/trainer/dashboard" active={location.pathname === "/trainer/dashboard"}>Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/trainer/members" active={location.pathname === "/trainer/members"}>My Members</Nav.Link>
          </Nav>
          <span className="text-white me-3 small">{displayName}</span>
          <Button variant="light" size="sm" onClick={handleLogout}>Sign out</Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default TrainerNavbar;
