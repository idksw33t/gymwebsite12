import './App.css'
import { useState } from 'react'
import AdminPortal from './admin/AdminPortal.jsx'

const stats = [
  { label: 'Members', value: '1,284', accent: 'orange' },
  { label: 'Classes', value: '32', accent: 'green' },
  { label: 'Revenue', value: '$18.4K', accent: 'purple' },
  { label: 'Retention', value: '92%', accent: 'blue' },
]

const classes = [
  { name: 'HIIT Burn', time: '06:30', coach: 'Maya', level: 'Advanced' },
  { name: 'Strength Lab', time: '08:15', coach: 'Chris', level: 'All levels' },
  { name: 'Core Flow', time: '12:00', coach: 'Ava', level: 'Beginner' },
  { name: 'Power Yoga', time: '18:30', coach: 'Nia', level: 'Intermediate' },
]

const trainers = [
  { name: 'Maya Ross', role: 'Conditioning Coach', shift: '6am - 2pm' },
  { name: 'Chris Hall', role: 'Strength Specialist', shift: '8am - 4pm' },
  { name: 'Ava Lee', role: 'Mobility Coach', shift: '11am - 7pm' },
]

const schedule = [
  ['Monday', 'Spin', '06:30', 'Maya'],
  ['Tuesday', 'Weights', '08:00', 'Chris'],
  ['Wednesday', 'Yoga', '18:00', 'Ava'],
  ['Thursday', 'HIIT', '17:30', 'Maya'],
  ['Friday', 'Recovery', '07:00', 'Ava'],
]

function App() {
  const [showAdmin, setShowAdmin] = useState(false)

  if (showAdmin) {
    return <AdminPortal onBack={() => setShowAdmin(false)} />
  }

  return (
    <div className="gym-app">
      <header className="topbar">
        <div className="logo-wrap">
          <div className="logo-mark">G</div>
          <div>
            <p className="brand-name">GymFlow</p>
            <span className="brand-tag">Performance club</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#overview">Overview</a>
          <a href="#classes">Classes</a>
          <a href="#coaches">Coaches</a>
          <a href="#schedule">Schedule</a>
        </nav>

        <button type="button" className="primary-button" onClick={() => setShowAdmin(true)}>
          Admin Portal
        </button>
      </header>

      <main className="page-shell" id="overview">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">New week, stronger results</span>
            <h1>Train harder. Recover smarter. Grow stronger.</h1>
            <p>
              Give your members a premium experience with expert coaching, structured
              programming, and a gym routine built around energy and consistency.
            </p>

            <div className="hero-actions">
              <button type="button" className="primary-button">
                View programs
              </button>
              <button type="button" className="secondary-button">
                Member dashboard
              </button>
            </div>

            <div className="mini-metrics">
              <div>
                <strong>84%</strong>
                <span>weekly attendance</span>
              </div>
              <div>
                <strong>12</strong>
                <span>new this month</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-label="Gym performance card">
            <div className="progress-card">
              <div className="ring"><span>82%</span></div>
              <div className="progress-copy">
                <p>Goal progress</p>
                <h3>Strength phase</h3>
              </div>
            </div>

            <div className="floating-card">
              <span className="dot success"></span>
              <div>
                <strong>+18%</strong>
                <small>member engagement</small>
              </div>
            </div>
          </div>
        </section>

        <section className="stats-grid" aria-label="Gym summary stats">
          {stats.map((stat) => (
            <article className={`stat-card ${stat.accent}`} key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel" id="classes">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">This week</p>
                <h2>Popular classes</h2>
              </div>
              <a href="#">See all</a>
            </div>

            <div className="class-list">
              {classes.map((item) => (
                <div className="class-item" key={item.name}>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.coach}</p>
                  </div>
                  <div className="class-meta">
                    <span>{item.time}</span>
                    <small>{item.level}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" id="coaches">
            <div className="panel-header">
              <div>
                <p className="panel-kicker">Team</p>
                <h2>Coaches</h2>
              </div>
              <a href="#">View team</a>
            </div>

            <div className="trainer-list">
              {trainers.map((trainer) => (
                <div className="trainer-item" key={trainer.name}>
                  <div className="avatar">{trainer.name.charAt(0)}</div>
                  <div className="trainer-details">
                    <h3>{trainer.name}</h3>
                    <p>{trainer.role}</p>
                  </div>
                  <span>{trainer.shift}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="schedule-panel" id="schedule">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Weekly plan</p>
              <h2>Training schedule</h2>
            </div>
            <a href="#">Export</a>
          </div>

          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Session</th>
                <th>Time</th>
                <th>Coach</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map(([day, session, time, coach]) => (
                <tr key={day}>
                  <td>{day}</td>
                  <td>{session}</td>
                  <td>{time}</td>
                  <td>{coach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}

export default App
