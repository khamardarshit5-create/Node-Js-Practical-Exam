# Task Manager

A multi-user Task Management System built with **Node.js, Express, MongoDB (Mongoose), EJS, and JWT authentication**. Supports two roles — `user` and `admin` — with role-based access control, secure password hashing, and full task/category CRUD.

## Project Overview

Users can register, log in, and manage their own tasks (create, edit, delete, categorize, set priority/status/due date). Admins can additionally view and manage **every** user's tasks from a dedicated "All User Tasks" page, and manage the global list of categories.

## Features

- User registration & login with hashed passwords (bcryptjs)
- JWT authentication stored in an HttpOnly cookie
- Role-based access control (`user` / `admin`)
- Users can only ever access/modify their own tasks — enforced server-side
- Admins can view, create, edit, and delete tasks for any user
- Full Task CRUD with status (`Pending`, `In Progress`, `Completed`) and priority (`Low`, `Medium`, `High`)
- Category management (admin-only) with tasks referencing categories
- Responsive Bootstrap 5 UI with role-aware navigation
- Centralized error handling (invalid IDs, validation errors, auth errors, 404s)
- Flash-style success/error messages via query params

## Technologies

- Node.js, Express.js
- MongoDB, Mongoose
- EJS templating
- jsonwebtoken, cookie-parser, bcryptjs
- body-parser, dotenv
- Bootstrap 5 + Bootstrap Icons (via CDN)

## Prerequisites

- Node.js v18+
- MongoDB running locally or a MongoDB Atlas connection string

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

```
PORT=3000
NODE_ENV=development
JWT_SECRET=change_this_secret
JWT_EXPIRES_IN=1d

# Optional convenience values used only by scripts/createAdmin.js
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
```

**Never commit your real `.env` file.**

## Database Setup

Make sure MongoDB is running and reachable at the URI in `MONGODB_URI`. No manual collection setup is required — Mongoose creates collections automatically the first time documents are saved.

## Creating the First Admin

Public registration **always** creates a `user` account — there is no way to register as `admin` through the UI or API, even by tampering with the form. To create (or promote) an admin, use the seed script:

```bash
npm run create-admin
```

This reads `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `.env`. Alternatively, pass values directly:

```bash
node scripts/createAdmin.js myadmin admin@example.com StrongPass123!
```

If the email already belongs to an existing user, that user is promoted to `admin`; otherwise a new admin account is created.

## Running the Application

```bash
npm start        
npm run dev      
```

Visit `http://localhost:3000`.

## User Flow

1. Register a new account at `/register` (always created as `user`)
2. Log in at `/login`
3. Create a task at `/tasks/new`
4. Edit or delete tasks from `/tasks`
5. Log out via the navbar

## Admin Flow

1. Log in with an admin account (created via `npm run create-admin`)
2. `/tasks` — the admin's own personal tasks
3. `/admin/tasks` — view, edit, and delete **any** user's tasks
4. `/categories` — create, edit, and delete categories
5. When creating/editing a task, admins can assign it to any registered user

## Project Structure

```
task-manager/
├── controllers/
│   ├── authController.js
│   ├── taskController.js
│   └── categoryController.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── models/
│   ├── User.js
│   ├── Task.js
│   └── Category.js
├── routes/
│   ├── authRoutes.js
│   ├── taskRoutes.js
│   └── categoryRoutes.js
├── views/
│   ├── partials/
│   │   ├── navbar.ejs
│   │   ├── head.ejs
│   │   └── scripts.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── taskList.ejs
│   ├── taskForm.ejs
│   ├── taskItem.ejs
│   ├── categoryList.ejs
│   ├── categoryForm.ejs
│   ├── error.ejs
│   └── forbidden.ejs
├── public/
│   ├── css/style.css
│   └── js/main.js
├── scripts/
│   └── createAdmin.js
├── .env.example
├── .gitignore
├── app.js
├── package.json
└── README.md
```

## Security Notes

- Passwords are hashed with bcryptjs before saving; the password field is excluded from queries by default (`select: false`).
- JWT contains only `userId`, `username`, and `role` — never the password.
- JWT is stored in an `httpOnly` cookie (not `localStorage`), with `secure: true` automatically enabled when `NODE_ENV=production`.
- All ownership and role checks happen **server-side** in controllers/middleware — the UI hides buttons for convenience only, never as the actual security boundary.
- Registration ignores any `role` field submitted by the client; only `scripts/createAdmin.js` can create/promote an admin.

## Testing Checklist

- [x] Register / duplicate email rejected / password hashed
- [x] Login / invalid login rejected / JWT issued and cookied
- [x] Logout clears the cookie
- [x] Protected routes redirect unauthenticated users to `/login`
- [x] A user can only view/edit/delete their own tasks (verified server-side, not just hidden UI)
- [x] A user cannot access `/admin/tasks` or `/categories` (403 Forbidden)
- [x] Admin can view/manage all tasks and categories
- [x] Navbar changes based on role
- [x] Responsive on mobile/tablet/desktop
