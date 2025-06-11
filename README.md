# 📋 QuickTask – Full Stack To-Do List Application

A **full-stack web application** that allows users to create, view, update, and delete to-do tasks.
Developed using **React.js** (frontend), **Flask** (backend), and **MySQL** (database).

---

## ✅ Features

* Create new tasks
* View all tasks
* Mark tasks as complete/incomplete
* Edit existing tasks
* Delete tasks
* Optimistic UI for instant feedback
* Persistent storage using MySQL

---

## ⚙️ Setup and Installation Instructions

### 🔧 Backend Setup (Flask + MySQL)

1. **Clone or download the repository** and navigate to the `backend` directory.

```bash
git clone https://github.com/YOUR_USERNAME/quicktask.git
cd quicktask-backend
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Configure MySQL Database:**

Create the database and table in MySQL:

```sql
CREATE DATABASE quicktask;
USE quicktask;

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE
);
```

## 🗄️ MySQL Database Configuration

| Field         | Type         | Description                  |
| ------------- | ------------ | ---------------------------- |
| `id`          | INT          | Primary Key (Auto Increment) |
| `title`       | VARCHAR(255) | Title of the task            |
| `description` | TEXT         | Detailed task description    |
| `completed`   | BOOLEAN      | Task completion status       |

---

### 📄 MySQL Database Setup Script

A ready SQL script is provided as `setup.sql`. Run it using **MySQL CLI** or **MySQL Workbench**:

#### ✅ Method 1: Using MySQL CLI

```bash
mysql -u root -p < setup.sql
```

→ Enter your MySQL password → database & table will be created ✅

#### ✅ Method 2: Using MySQL Workbench

1. Open **MySQL Workbench**.
2. Create a **new SQL tab**.
3. **Paste** the contents of `setup.sql`.
4. Click **Execute** → Done.

---

### ✅ **Summary → Simple steps:**

1️⃣ **Create `setup.sql`** file in your **project root**.
2️⃣ **In `README.md` → add above content under `MySQL Database Configuration`**.
3️⃣ ✅ Done → Clean → Professional → Ready for interview.


4. **Set your MySQL credentials in `config.py`:**

```python
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'YOUR_MYSQL_PASSWORD',
    'database': 'quicktask'
}
```

5. **Run the backend server:**

```bash
python app.py
```

Backend runs at → `http://localhost:5000`

---

### 💻 Frontend Setup (React)

1. Navigate to the frontend directory:

```bash
cd quicktask-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the React development server:

```bash
npm run dev
```

Frontend will be available at → `http://localhost:5173`

---


## 📌 API Endpoints

| Method | Endpoint           | Description             |
| ------ | ------------------ | ----------------------- |
| GET    | `/tasks`           | Retrieve all tasks      |
| POST   | `/tasks`           | Create a new task       |
| PUT    | `/tasks/<task_id>` | Update an existing task |
| DELETE | `/tasks/<task_id>` | Delete a task           |

---

## 📝 Assumptions & Notes

* The app assumes that **MySQL Server** is installed and running locally.
* The React frontend assumes the Flask backend is available at `http://localhost:5000`.
* No authentication is implemented for simplicity. Security and auth can be added in future.
* All tasks are available to all users.

---

## 👨‍💻 Author

* **Developer:** \[Aditya Vishwakarma]
* **GitHub Profile:** [https://github.com/cyberfortify](https://github.com/cyberfortify)