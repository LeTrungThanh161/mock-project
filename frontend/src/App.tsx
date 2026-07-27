<<<<<<< Updated upstream
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Utilities from './pages/Utilities';
import StudentProfile from './pages/StudentProfile';
import { PricingTiers } from './pages/PricingTiers';
import { MeterReadings } from './pages/MeterReadings';
import { Invoices } from './pages/Invoices';
import { Technicians } from './pages/Technicians';
import { IssueTickets } from './pages/IssueTickets';
import { StudentInvoices } from './pages/StudentInvoices';
import { StudentHelpdesk } from './pages/StudentHelpdesk';
import './App.css';

// Guard: Nếu chưa đăng nhập → chuyển về /login
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const RoleBasedInvoices = () => {
  const { user } = useAuth();
  return user?.role === 'STUDENT' ? <StudentInvoices /> : <Invoices />;
};

const RoleBasedHelpdesk = () => {
  const { user } = useAuth();
  return user?.role === 'STUDENT' ? <StudentHelpdesk /> : <IssueTickets />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private (cần đăng nhập) */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/profile" replace />} />
        <Route path="profile"           element={<StudentProfile />} />
        <Route path="dashboard"         element={<Dashboard />} />
        <Route path="helpdesk"          element={<RoleBasedHelpdesk />} />
        <Route path="utilities"         element={<Utilities />} />
        <Route path="pricing-tiers"     element={<PricingTiers />} />
        <Route path="meter-readings"    element={<MeterReadings />} />
        <Route path="technicians"       element={<Technicians />} />
        {/* Placeholder routes */}
        <Route path="buildings"         element={<Dashboard />} />
        <Route path="students"          element={<Dashboard />} />
        <Route path="applications"      element={<Dashboard />} />
        <Route path="contracts"         element={<Dashboard />} />
        <Route path="absences"          element={<Dashboard />} />
        <Route path="invoices"          element={<RoleBasedInvoices />} />
        <Route path="room-registration" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
>>>>>>> Stashed changes

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
