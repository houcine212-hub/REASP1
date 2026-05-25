import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateProject from './pages/CreateProject';
import ProjectsList from './pages/ProjectsList';
import AllProjects from './pages/AllProjects';
import ProjectDetail from './pages/ProjectDetail';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateProject />} />
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/all-projects" element={<AllProjects />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
