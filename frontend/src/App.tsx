import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Helpdesk from './pages/Helpdesk';
import Utilities from './pages/Utilities';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="helpdesk" element={<Helpdesk />} />
          <Route path="utilities" element={<Utilities />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
