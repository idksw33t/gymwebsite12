import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Button, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state && location.state.registered;

  // After login: Admin -> Screen 2, Trainer -> Screen 9, Member -> Screen 13.
  const homeByRole = {
    Admin: '/admin/dashboard',
    Trainer: '/trainer/dashboard',
    Member: '/member/dashboard',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const role = await login(email, password);
      navigate(homeByRole[role] || '/login');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Is the API running (and its https certificate trusted)?');
      } else if (err.response.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="lg-bg d-flex justify-content-center align-items-center p-3">
      <Card className="lg-card">
        <div className="lg-hero">
          <p className="lg-kicker">Strength &bull; Discipline &bull; Results</p>
          <h1 className="lg-slogan">
            Train hard.<br />
            <span>Stay strong.</span>
          </h1>
        </div>

        <Card.Body className="lg-form-wrap">
          <h2 className="lg-title">Motion Studio</h2>
          <p className="lg-sub">Sign in to your account</p>

          {justRegistered && !error && (
            <Alert variant="success">Account created. Please log in.</Alert>
          )}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email : </Form.Label>
              <Form.Control
                type="email"
                placeholder="user@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Password :</Form.Label>
              <Form.Control
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" className="w-100 lg-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
