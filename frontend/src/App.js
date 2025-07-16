import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import ProjectPage from "./ProjectPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/page/:id" element={<ProjectPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
