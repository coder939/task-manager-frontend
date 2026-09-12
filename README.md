# Task Manager — Full-Stack Project Management Platform

A modern full-stack project management application built to help teams organize projects, manage tasks, collaborate in real time, and track progress from one place.

The platform includes project and team management, task assignment, Kanban workflow, comments, file attachments, notifications, real-time project chat, user administration, dark mode, and a built-in smart work assistant connected directly to the application database.

## Live Demo

**Frontend:**  
https://task-manager-frontend-coder939.vercel.app

**Backend API:**  
https://task-manager-backend-wyh1.onrender.com

> The backend is hosted on Render's free tier, so the first request after a period of inactivity may take a short time while the service wakes up.

---

## Features

- Secure user authentication
- Email verification
- Forgot password and password reset
- Role-based access control
- Admin user management
- Project creation and management
- Project member management
- Task creation, assignment, editing, and deletion
- Task priorities and due dates
- Task status tracking
- Kanban board
- Dashboard statistics
- Task comments
- File attachments
- Activity tracking
- Notifications
- Due-date reminders
- Real-time project team chat with Socket.IO
- Chat unread-message tracking
- Smart Work Assistant connected directly to MongoDB
- Light and dark themes
- Responsive user interface
- Protected application routes

---

## Smart Work Assistant

The application includes a built-in Smart Work Assistant designed specifically for the Task Manager platform.

Unlike a general-purpose external AI service, the assistant works directly with the application's own backend and MongoDB data.

It can help users with requests such as:

```text
How many tasks do I have?
Show my overdue tasks
Show my projects
What should I work on first?
Who is in ProjectName?
Summarize ProjectName
Create a project
Create a task
```

For write operations such as creating projects or tasks, the assistant prepares the action and requires user confirmation before executing it through the application's existing APIs and permission system.

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Socket.IO Client
- React Toastify
- CSS
- JavaScript

### Backend

The backend is maintained in a separate repository and uses:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO
- Nodemailer
- Multer
- Swagger

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## Application Architecture

```text
                    ┌───────────────────────┐
                    │        User           │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   React + Vite App    │
                    │       Vercel          │
                    └───────────┬───────────┘
                                │
                    REST API + Socket.IO
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Node.js / Express    │
                    │       Render          │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │     MongoDB Atlas     │
                    └───────────────────────┘
```

---

## Main Application Areas

### Dashboard

Provides an overview of the user's projects and tasks, including task status and priority statistics.

### Projects

Users can create and manage projects and control project membership according to their permissions.

### Tasks

Tasks can include:

- Title
- Description
- Project
- Assigned user
- Priority
- Status
- Due date
- Comments
- Attachments

### Kanban Board

Provides a visual workflow for moving through task states such as:

```text
Todo → In Progress → Done
```

### Project Team Chat

Each project includes a real-time team chat powered by Socket.IO.

Features include:

- Live messages
- Persistent chat history
- File attachments
- Unread message tracking
- Message deletion permissions
- Project-scoped access control

### User Management

Administrators can manage registered users and user roles.

### Smart Work Assistant

Users can ask the assistant questions about their own work and perform supported project/task actions using natural-language commands.

---

## Authentication Flow

```text
Register
   ↓
Email Verification
   ↓
Login
   ↓
JWT Authentication
   ↓
Protected Application Routes
```

The application also supports:

```text
Forgot Password
   ↓
Reset Email
   ↓
Secure Reset Link
   ↓
New Password
```

---

## Project Structure

```text
task-manager-frontend/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── AIAssistant.jsx
│   │   ├── KanbanColumn.jsx
│   │   ├── KanbanTaskCard.jsx
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProjectChat.jsx
│   │   └── Sidebar.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Kanban.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   ├── Projects.jsx
│   │   ├── Register.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── Tasks.jsx
│   │   ├── UserManagement.jsx
│   │   └── VerifyEmail.jsx
│   │
│   ├── routes/
│   ├── services/
│   ├── styles/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── package.json
├── vercel.json
└── vite.config.js
```

---

## Local Development

### 1. Clone the frontend repository

```bash
git clone https://github.com/coder939/task-manager-frontend.git
cd task-manager-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Create:

```text
.env
```

and add:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Start the development server

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

---

## Production Environment Variables

For deployment, configure the following variables in Vercel:

```env
VITE_BACKEND_URL=https://your-backend.onrender.com
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

Do not place private backend secrets such as MongoDB credentials, JWT secrets, or email passwords in frontend environment variables.

---

## Backend Repository

The backend is maintained separately:

**GitHub:**  
https://github.com/coder939/task-manager-backend

It contains the REST API, authentication, MongoDB models, Socket.IO server, notifications, email services, task reminders, file uploads, and smart assistant backend logic.

---

## Security

The application uses several security practices:

- JWT-based authentication
- Protected frontend routes
- Backend authorization middleware
- Role-based admin permissions
- Project-level access control
- Environment variables for secrets
- MongoDB Atlas network restrictions
- Confirmation before assistant write actions
- Server-side validation
- Sensitive `.env` files excluded from Git

---

## Screenshots

Screenshots will be added here during the final portfolio-polish stage.

Suggested screenshots:

- Login / Register
- Dashboard
- Projects
- Tasks
- Kanban Board
- Project Team Chat
- Smart Work Assistant
- Admin User Management
- Dark Mode

---

## Future Improvements

Possible future improvements include:

- Permanent cloud storage for uploaded files
- Advanced analytics
- Search across projects and tasks
- Calendar integration
- More Smart Work Assistant commands
- Task editing through the assistant
- Project activity timeline improvements
- Mobile/PWA enhancements
- Automated tests
- CI/CD quality checks

---

## Author

**Batoul Atris**

Computer and Communications Engineering — Software Engineering focus

GitHub:  
https://github.com/coder939

---

## License

This project was built for educational, portfolio, and software-engineering practice purposes.
