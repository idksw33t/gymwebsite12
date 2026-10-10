import React from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AppNavbar() {
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
        <Navbar.Brand as={Link} to="/member/dashboard">Motion Studio</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/member/dashboard" active={location.pathname === "/member/dashboard"}>Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/member/programme" active={location.pathname === "/member/programme"}>My Programme</Nav.Link>
            <Nav.Link as={Link} to="/member/plans" active={location.pathname === "/member/plans"}>My Plans</Nav.Link>
            <Nav.Link as={Link} to="/member/tasks" active={location.pathname === "/member/tasks"}>My Tasks</Nav.Link>
          </Nav>
          <span className="text-white me-3 small">{displayName}</span>
          <Button variant="light" size="sm" onClick={handleLogout}>Sign out</Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
