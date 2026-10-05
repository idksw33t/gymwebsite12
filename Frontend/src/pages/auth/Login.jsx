import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Card, Form, Button, Alert, Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

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
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="auth-bg d-flex justify-content-center align-items-center p-3">
      <Card className="auth-card">
        <Card.Body className="p-4">
          <h2 className="text-center mb-1 auth-title">Motion Studio</h2>
          <p className="text-center text-muted mb-4">Sign in to your account</p>

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

            <Button type="submit" className="w-100 auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </Form>

          <p className="text-center mt-4 mb-0">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Register
            </Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
