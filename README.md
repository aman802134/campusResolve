# 🎓Campusresolve

> A grivience resolver plattform . this project , will have a role-based access control (RBAC) for educational institutions , here staff’s , students can submit the complaints to their respective department , where their issues will be resolved by the department head. in this system , tracking , escalation and resolve workflow is available through which the issues will be resolved .

## ## Vision Statement (Draft)

> “To create a secure, transparent platform where every member of a campus community—students, staff, and faculty—can raise grievances directly, track progress in real time, and hold the system accountable until resolution.”

## 🚀 Live Demo

[campusresolve api]()

## ✅ Features

- Ticket creation
- Role-based login (RBAC)
- Ticket escalation to higher authorities
- sensitive issue get priority
- Anonymous Peer Review

## 📦 Tech Stack

| Layer      | Technology         |
| ---------- | ------------------ |
| Backend    | Node.js + Express  |
| Database   | MongoDB (Mongoose) |
| Auth       | JWT + Cookies      |
| Dependency | TypeScript         |

## 🛠 Setup

### if you are cloning (git clone)

```bash
npm install
npm run dev
```

## 🧪 API Collection

You can download and import the full Postman API collection:

[📥 Download CampusResolve.postman_collection.json](./CampusResolve.postman_collection.json)

## 📬 API Endpoints Overview

| Method | Endpoint                      | Description                        |
| ------ | ----------------------------- | ---------------------------------- |
| POST   | /auth/register                | Register a new user                |
| POST   | /auth/login                   | Login and receive a JWT cookie     |
| POST   | /auth/logout                  | Logout the current user            |
| GET    | /auth/getUsers                | Get all users                      |
| GET    | /auth/getUserByid             | Get user by ID                     |
| POST   | /campus/create-campus         | Create a new campus                |
| GET    | /campus/all-campus            | Get all campuses                   |
| POST   | /department/create-department | Create a department                |
| GET    | /department/get-departments   | Get departments for a campus       |
| PATCH  | /department/:id/domain        | Update department domains          |
| PATCH  | /admin/assign-role/:userId    | Approve a user's requested role    |
| PATCH  | /admin/reject-role/:userId    | Reject a user's requested role     |
| GET    | /admin/pending-role-requests  | Get all pending role requests      |
| POST   | /ticket/create-ticket         | Create a new ticket                |
| GET    | /ticket/getUserTickets        | Get tickets for the logged-in user |
| GET    | /ticket/getTicketByid         | Get a ticket by its ID             |
| PATCH  | /ticket/update/:ticketId      | Update a ticket (status, comment)  |
| PATCH  | /escalate/:ticketId           | Escalate a ticket                  |
