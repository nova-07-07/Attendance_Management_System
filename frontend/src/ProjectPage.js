import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ProjectPage() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);
  const [title, setTitle] = useState("");
  const [savedData, setSavedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [projectName, setProjectName] = useState("");

  const uploadFile = async () => {
    if (!file) return alert("Please select a file");
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/upload/${id}`, formData);
      if (res.data.status === "ok") {
        setTableData(res.data.data);
        setColumns(res.data.columns);
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Upload error");
    }
    setLoading(false);
  };

  const toggleColumn = (col) => {
    setSelectedCols((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const saveSelectedColumns = async () => {
    if (!title.trim() || selectedCols.length === 0) {
      return alert("Enter title and select columns");
    }

    const rows = editingEntry ? editingEntry.rows : tableData;

    setSaving(true);
    try {
      await axios.post(`http://localhost:5000/attendance/${id}`, {
        title,
        columns: selectedCols,
        rows,
        entryId: editingEntry?._id,
      });
      resetForm();
      fetchSavedData();
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed");
    }
    setSaving(false);
  };

  const fetchSavedData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/attendance/${id}`);
      setSavedData(res.data);
    } catch (err) {
      console.error("Fetch error", err);
      alert("Fetch error");
    }
  };

  const fetchProjectName = async () => {
    try {
      const res = await axios.get("http://localhost:5000/projects");
      const project = res.data.find((p) => p.id.toString() === id);
      if (project) setProjectName(project.name);
    } catch (err) {
      console.error("Failed to load project name", err);
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      await axios.delete(`http://localhost:5000/attendance/${id}/${entryId}`);
      fetchSavedData();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const editEntry = (entry) => {
    if (editingEntry && editingEntry._id !== entry._id) {
      alert("Finish editing the current group before editing another.");
      return;
    }
    setTitle(entry.title);
    setSelectedCols(entry.columns);
    setEditingEntry({ ...entry });
  };

  const updateCell = (rowIndex, col, value) => {
    const updated = [...editingEntry.rows];
    updated[rowIndex][col] = value;
    setEditingEntry({ ...editingEntry, rows: updated });
  };

  const resetForm = () => {
    setTitle("");
    setSelectedCols([]);
    setEditingEntry(null);
  };

  useEffect(() => {
    fetchSavedData();
    fetchProjectName();
  }, [id]);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Project: {projectName}</h1>

      <div className="mb-4">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={uploadFile}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Excel"}
        </button>
      </div>

      {columns.length > 0 && (
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h2 className="text-lg font-semibold mb-2">
            {editingEntry ? "Edit Attendance Group" : "Select Columns"}
          </h2>

          <div className="flex flex-wrap gap-4 mb-4">
            {columns.map((col) => (
              <label key={col} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedCols.includes(col)}
                  onChange={() => toggleColumn(col)}
                />
                <span>{col}</span>
              </label>
            ))}
          </div>

          <input
            type="text"
            placeholder="Enter title"
            className="border px-3 py-2 rounded w-1/2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            onClick={saveSelectedColumns}
            className="ml-3 bg-green-600 text-white px-4 py-2 rounded"
            disabled={saving}
          >
            {saving ? "Saving..." : editingEntry ? "Update" : "Save"}
          </button>
          {editingEntry && (
            <button
              onClick={resetForm}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {savedData.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-3">Saved Attendance Groups</h2>
          {savedData.map((entry, idx) => {
            const isEditingThisGroup = editingEntry && editingEntry._id === entry._id;
            const rowsToDisplay = isEditingThisGroup ? editingEntry.rows : entry.rows;

            return (
              <div key={idx} className="border p-4 mb-4 rounded shadow-sm bg-white">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{entry.title}</h3>
                    <p className="text-sm text-gray-600">
                      Saved on: {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => editEntry(entry)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                      disabled={!!editingEntry && editingEntry._id !== entry._id}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(entry._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                      disabled={!!editingEntry}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="overflow-auto">
                  <table className="w-full border text-sm">
                    <thead>
                      <tr>
                        {entry.columns.map((col) => (
                          <th key={col} className="border p-2 bg-gray-200">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rowsToDisplay.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {entry.columns.map((col, colIndex) => {
                            const isFirstCol = colIndex === 0;
                            return (
                              <td key={col + rowIndex} className="border p-2">
                                {isEditingThisGroup && !isFirstCol ? (
                                  <input
                                    type="text"
                                    className="border px-1 py-1 w-full"
                                    value={editingEntry.rows?.[rowIndex]?.[col] ?? ""}
                                    onChange={(e) =>
                                      updateCell(rowIndex, col, e.target.value)
                                    }
                                  />
                                ) : (
                                  row[col]
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
