import { Routes, Route } from 'react-router-dom';
import Login from '@/pages/Login';
import ProjectList from '@/pages/ProjectList';
import ProjectDashboard from '@/pages/ProjectDashboard';
import Header from '@/components/Header';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/:projectId" element={<ProjectDashboard />} />
      </Routes>
    </>
  );
}

export default App;
