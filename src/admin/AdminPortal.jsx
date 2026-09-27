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

  return (
    <>
      <ToastContainer position="top-right" />
      <Container fluid="lg" className="py-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <Button variant="link" className="p-0 mb-2" onClick={onBack}>Back to GymFlow</Button>
            <h1 className="h3 mb-0">Gym administration</h1>
          </div>
          {admin && (
            <div className="d-flex align-items-center gap-3">
              <span>{admin.email}</span>
              <Button variant="outline-secondary" onClick={handleLogout}>Sign out</Button>
            </div>
          )}
        </div>

        {admin ? (
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
        ) : (
          <div className="mx-auto" style={{ maxWidth: 440 }}>
            <h2 className="h4 mb-3">Administrator sign in</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="adminEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="adminPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </Form>
          </div>
        )}
      </Container>
    </>
  )
}

export default AdminPortal