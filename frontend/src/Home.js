import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const loadProjects = async () => {
    const res = await axios.get("http://localhost:5000/projects");
    setProjects(res.data.reverse());
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">My Projects</h1>

      {projects.map(p => (
        <div
          key={p.id}
          className="mt-4 border p-2 shadow cursor-pointer hover:bg-gray-100"
          onClick={() => navigate(`/page/${p.id}`)}
        >
          <h2 className="text-lg font-semibold">{p.name}</h2>
          <p>{p.description}</p>
          <small>Last edited: {new Date(p.lastEdited).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
