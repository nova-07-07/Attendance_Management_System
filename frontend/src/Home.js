import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const navigate = useNavigate();

  const loadProjects = async () => {
    const res = await axios.get("http://localhost:5000/projects");
    setProjects(res.data.reverse());
  };

  const createProject = async () => {
    await axios.post("http://localhost:5000/projects", { name, description: desc });
    setShowModal(false);
    loadProjects();
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">My Projects</h1>
      <button className="btn bg-green-500 text-white p-2 rounded" onClick={() => setShowModal(true)}>+ New Project</button>

      {projects.map(p => (
        <div key={p.id} className="mt-4 border p-2 shadow" onClick={() => navigate(`/page/${p.id}`)}>
          <h2 className="text-lg font-semibold">{p.name}</h2>
          <p>{p.description}</p>
          <small>Last edited: {new Date(p.lastEdited).toLocaleString()}</small>
        </div>
      ))}

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 p-10">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl mb-2">New Project</h2>
            <input className="border p-2 w-full mb-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <textarea className="border p-2 w-full mb-2" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <button className="btn bg-blue-500 text-white p-2 rounded" onClick={createProject}>Create</button>
            <button className="btn ml-2" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
