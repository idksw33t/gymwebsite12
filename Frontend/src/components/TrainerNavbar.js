import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

function TrainerNavbar() {
  const location = useLocation();

  return (
    <Navbar className="navbar-brand-custom" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Motion Studio</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={location.pathname === "/"}>Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/programme" active={location.pathname === "/programme"}>My Programme</Nav.Link>
            <Nav.Link as={Link} to="/plans" active={location.pathname === "/plans"}>My Plans</Nav.Link>
            <Nav.Link as={Link} to="/tasks" active={location.pathname === "/tasks"}>My Tasks</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default TrainerNavbar;