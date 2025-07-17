# 📊 Excel Attendance Manager (Flask + React)

This is a simple web application for uploading Excel files, selecting specific columns (like student names and attendance data), and saving attendance groups. You can edit or delete saved groups directly from the UI.

---

## 🔧 Tech Stack

- **Frontend**: React
- **Backend**: Python Flask
- **Data Format**: Excel (`.xlsx`)
- **Storage**: JSON files on disk (`projects.json`, attendance JSONs)

---

## 🚀 Getting Started

### 🐍 Backend (Python + Flask)

1. **Install dependencies**:

```bash
cd backend
pip install -r requirements.txt
```

2. **Run the server:

```bash
python server.py
```

The server runs on http://localhost:5000

### ⚛️ Frontend (React)
Install dependencies:
```bash
cd frontend
npm install
```

Run the app:

```bash
npm start
```

The React app runs on http://localhost:3000

📦 Features

* Upload .xlsx files

* Select columns to save

* Name and group selected columns as "attendance sets"

* View all saved groups

* Edit row values inside any group

* Delete unwanted groups

## Thank you for using my application!
