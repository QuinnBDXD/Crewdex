import { Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ProjectList from '@/pages/ProjectList';
import ProjectDashboard from '@/pages/ProjectDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/projects" element={<ProjectList />} />
      <Route path="/projects/:projectId" element={<ProjectDashboard />} />
    </Routes>
  );
}

export default App;
