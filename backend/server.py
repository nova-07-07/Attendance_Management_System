from flask import Flask, request, jsonify
from flask_cors import CORS
import os, json, uuid
from datetime import datetime
import pandas as pd
import time

def create_noon_project_and_attendance():
    today_str = datetime.now().strftime("%Y-%m-%d")
    projects = read_json(DATA_FILE)

    # Check if a project for today already exists
    existing_project = next((p for p in projects if p["name"] == today_str), None)

    if not existing_project:
        # Create new project
        project_id = str(uuid.uuid4())[:8]
        new_project = {
            "id": project_id,
            "name": today_str,
            "description": "",
            "lastEdited": datetime.now().isoformat()
        }
        projects.append(new_project)
        write_json(DATA_FILE, projects)
        print(f"[INFO] Created new project: {today_str}")
    else:
        project_id = existing_project["id"]
        print(f"[INFO] Project for {today_str} already exists.")

    # Create empty attendance file if it doesn't exist
    att_file = os.path.join(ATTENDANCE_DIR, f"{project_id}.json")
    if not os.path.exists(att_file):
        write_json(att_file, [])
        print(f"[INFO] Created empty attendance file for project ID {project_id}")
    else:
        print(f"[INFO] Attendance file for project ID {project_id} already exists.")

app = Flask(__name__)
CORS(app)

DATA_FILE = "projects.json"
UPLOAD_DIR = "uploads"
ATTENDANCE_DIR = "attendance"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(ATTENDANCE_DIR, exist_ok=True)

def read_json(path):
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)

def write_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

@app.route("/projects", methods=["GET"])
def get_projects():
    return jsonify(read_json(DATA_FILE))

@app.route("/projects", methods=["POST"])
def add_project():
    item = request.get_json()
    if not item or "name" not in item or "description" not in item:
        return jsonify({"error": "Missing name or description"}), 400

    projects = read_json(DATA_FILE)
    project_id = str(uuid.uuid4())[:8]
    new_project = {
        "id": project_id,
        "name": item["name"],
        "description": item["description"],
        "lastEdited": datetime.now().isoformat()
    }
    projects.append(new_project)
    write_json(DATA_FILE, projects)
    return jsonify(new_project)

@app.route("/upload/<project_id>", methods=["POST"])
def upload_excel(project_id):
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = os.path.join(UPLOAD_DIR, f"{project_id}.xlsx")
    file.save(file_path)

    try:
        df = pd.read_excel(file_path)
        return jsonify({"status": "ok", "data": df.to_dict(orient="list"), "columns": df.columns.tolist()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/attendance/<project_id>", methods=["POST"])
def save_or_update_columns(project_id):
    data = request.get_json()
    title = data.get("title")
    columns = data.get("columns", [])
    rows = data.get("rows")
    entry_id = data.get("entryId")

    att_file = os.path.join(ATTENDANCE_DIR, f"{project_id}.json")
    all_data = read_json(att_file)

    if entry_id:
        for i, entry in enumerate(all_data):
            if entry.get("_id") == entry_id:
                all_data[i] = {
                    "_id": entry_id,
                    "title": title,
                    "columns": columns,
                    "timestamp": datetime.now().isoformat(),
                    "rows": rows
                }
                write_json(att_file, all_data)
                return jsonify({"status": "updated"})

    file_path = os.path.join(UPLOAD_DIR, f"{project_id}.xlsx")
    if not os.path.exists(file_path):
        return jsonify({"error": "Excel file not found"}), 404

    try:
        df = pd.read_excel(file_path)
        selected_rows = df[columns].to_dict(orient="records")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    new_entry = {
        "_id": str(uuid.uuid4())[:8],
        "title": title,
        "columns": columns,
        "timestamp": datetime.now().isoformat(),
        "rows": selected_rows
    }
    all_data.append(new_entry)
    write_json(att_file, all_data)
    return jsonify({"status": "saved"})

@app.route("/attendance/<project_id>", methods=["GET"])
def get_saved_attendance(project_id):
    att_file = os.path.join(ATTENDANCE_DIR, f"{project_id}.json")
    return jsonify(read_json(att_file))

@app.route("/attendance/<project_id>/<entry_id>", methods=["DELETE"])
def delete_attendance_entry(project_id, entry_id):
    att_file = os.path.join(ATTENDANCE_DIR, f"{project_id}.json")
    data = read_json(att_file)
    new_data = [entry for entry in data if entry.get("_id") != entry_id]
    write_json(att_file, new_data)
    return jsonify({"status": "deleted"})

@app.route("/attendance/<project_id>/<entry_id>", methods=["PUT"])
def edit_attendance_entry(project_id, entry_id):
    data = request.get_json()
    title = data.get("title")
    columns = data.get("columns")
    rows = data.get("rows")

    if not (title and columns and rows):
        return jsonify({"error": "Missing title, columns or rows"}), 400

    att_file = os.path.join(ATTENDANCE_DIR, f"{project_id}.json")
    all_data = read_json(att_file)

    found = False
    for i, entry in enumerate(all_data):
        if entry.get("_id") == entry_id:
            all_data[i] = {
                "_id": entry_id,
                "title": title,
                "columns": columns,
                "timestamp": datetime.now().isoformat(),
                "rows": rows
            }
            found = True
            break

    if not found:
        return jsonify({"error": "Entry not found"}), 404

    write_json(att_file, all_data)
    return jsonify({"status": "updated"})


if __name__ == "__main__":
    now = datetime.now()
    noon = now.replace(hour=12, minute=0, second=0, microsecond=0)
    print(now,"-",noon)
    if now < noon:
        seconds_until_noon = (noon - now).total_seconds()
        print(f"[INFO] Waiting until 12:00 PM ({int(seconds_until_noon)} seconds)...")
        time.sleep(seconds_until_noon)
        create_noon_project_and_attendance()
    else:
        create_noon_project_and_attendance()

    app.run(debug=True)