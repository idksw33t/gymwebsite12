import { useEffect, useState } from 'react'
import { Alert, Button, Container, Form, Nav, Spinner, Tab } from 'react-bootstrap'
import { toast, ToastContainer } from 'react-toastify'
import api from '../services/api'
import Assignments from './Assignments'
import MembersList from './MembersList'
import TrainersList from './TrainersList'

function AdminPortal({ onBack }) {
  const [email, setEmail] = useState('admin@gym.com')
  const [password, setPassword] = useState('')
  const [admin, setAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState('members')
  const [checkingSession, setCheckingSession] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/auth/me')
      .then(({ data }) => setAdmin(data))
      .catch(() => setAdmin(null))
      .finally(() => setCheckingSession(false))
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      setAdmin(data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not sign in. Check the email and password.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout')
      setAdmin(null)
      setPassword('')
    } catch {
      toast.error('Could not sign out.')
    }
  }

  if (checkingSession) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
      </Container>
    )
  }

  if (!admin) {
    return (
      <>
      <ToastContainer position="top-right" />
      <div className="login-page">
        <aside className="login-brand">
          <div className="login-brand-inner">
            <div className="login-logo">G</div>
            <h1>GymFlow</h1>
            <p>Manage members, trainers and training programmes from one place.</p>
            <ul className="login-points">
              <li>Add and update members and trainers</li>
              <li>Assign trainers and programmes</li>
              <li>Search and track everything quickly</li>
            </ul>
          </div>
        </aside>

        <main className="login-panel">
          <div className="login-card">
            <button type="button" className="login-back" onClick={onBack}>
              &larr; Back to GymFlow
            </button>

            <span className="login-kicker">Admin Portal</span>
            <h2>Welcome back</h2>
            <p className="login-sub">Sign in with your administrator account to continue.</p>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="adminEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  size="lg"
                  placeholder="admin@gym.com"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="adminPassword">
                <Form.Label>Password</Form.Label>
                <div className="password-wrap">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    size="lg"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </Form.Group>

              <Button type="submit" size="lg" className="w-100" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </Form>
          </div>
        </main>
      </div>
      </>
    )
  }

  return (
    <div className="admin-page">
      <ToastContainer position="top-right" />

      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-brand">
            <div className="admin-logo">G</div>
            <div>
              <strong>GymFlow</strong>
              <span>Administration</span>
            </div>
          </div>

          <div className="admin-user">
            <button type="button" className="admin-back" onClick={onBack}>
              &larr; Back to site
            </button>
            <span className="admin-email">{admin.email}</span>
            <Button variant="light" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
        </div>
      </header>

      <Container fluid="lg" className="py-4">
        <div className="admin-card">
          <Tab.Container activeKey={activeTab} onSelect={(key) => key && setActiveTab(key)}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item><Nav.Link eventKey="members">Members</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="trainers">Trainers</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="assignments">Assignments</Nav.Link></Nav.Item>
            </Nav>
            <Tab.Content>
              <Tab.Pane eventKey="members"><MembersList /></Tab.Pane>
              <Tab.Pane eventKey="trainers"><TrainersList /></Tab.Pane>
              <Tab.Pane eventKey="assignments"><Assignments active={activeTab === 'assignments'} /></Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </Container>
    </div>
  )
}

export default AdminPortal
