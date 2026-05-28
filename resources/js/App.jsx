import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import CreateProject from './pages/CreateProject';
import ProjectsList from './pages/ProjectsList';
import AllProjects from './pages/AllProjects';
import ProjectDetail from './pages/ProjectDetail';
import Offline from './pages/Offline';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create" element={<CreateProject />} />
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/all-projects" element={<AllProjects />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/offline" element={<Offline />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
