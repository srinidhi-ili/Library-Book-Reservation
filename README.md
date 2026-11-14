# Library Book Reservation System

A full‑stack web application for managing library book reservations.

## Features
- Student registration & login (JWT auth)
- Book catalog with search & filter
- Reservation workflow with approval, issue, return & overdue tracking
- Librarian admin dashboard for managing books & reservations
- Responsive modern UI built with plain HTML, CSS and vanilla JavaScript
- Backend powered by Node.js, Express and MongoDB (Atlas or local)

## Project Structure
```
library-book-reservation/
  frontend/          # static assets (HTML, CSS, JS)
  backend/           # Express server
    models/          # Mongoose models (User, Book, Reservation)
    routes/          # API routes
    controllers/    # Route handlers (optional – logic could be inline)
    middleware/      # auth, role checks, error handling
    config/          # DB connection config
    server.js        # entry point
    .env.example     # env var template
  README.md          # you are reading it!
```

## Getting Started
1. **Clone the repo** (or copy the folder).
2. **Backend**
   ```bash
   cd library-book-reservation/backend
   npm install
   cp .env.example .env   # edit with your MongoDB connection string & JWT secret
   npm start               # runs on http://localhost:5000
   ```
3. **Frontend**
   Open `frontend/index.html` in a browser (or serve via any static server).

## Scripts
- `npm start` – start the Express server (nodemon if installed).
- `npm run dev` – start with nodemon for hot reload.

## Environment Variables (`.env.example`)
```
MONGODB_URI=mongodb://localhost:27017/librarydb
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

## License
MIT
