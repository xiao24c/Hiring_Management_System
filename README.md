# Hiring Management System

Employee & HR portal for onboarding, personal info, document upload, and visa management.

## Tech Stack

- Frontend: React 18 (Vite), Redux Toolkit, React Router v6, Ant Design, Axios
- Backend: Node.js, Express, MongoDB + Mongoose, JWT auth, Nodemailer (emails), Multer (file upload)

## Features

### Employees
- Token-based registration (email locked)
- Login with session persistence
- Onboarding application: draft/save/submit, feedback/resubmit
- Personal info page: sectioned edit/save/cancel with confirmation
- File upload with preview/download (profile/ID/work auth)
- Visa (F1 OPT) workflow: step-by-step submit/resubmit with HR feedback

### HR
- Generate registration tokens + send email (3h expiry), token history
- Onboarding review: view/approve/reject with feedback
- Employee Profiles: search and view full profile
- Visa management: In Progress/All, preview/download, approve/reject, notify employee

## Project Structure
```
Hiring_Management_System/
├── client/
│   └── src/
│       ├── api/
│       ├── components/
        ├── hooks/
│       ├── pages/
│       ├── routes/
│       └── store/
└── server/
    ├── src/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   └── utils/
    ├── uploads/
    └── scripts/
```

## Environment Variables (`server/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/hiring_management
JWT_SECRET=your_jwt_secret

# Email (optional; logs to console if missing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Frontend URL for registration links
FRONTEND_URL=http://localhost:5173

# Optional seed file base
SEED_FILE_BASE_URL=http://localhost:5050/uploads
```
Frontend optional:
```env
VITE_FILE_BASE_URL=http://localhost:5050/uploads
```

## Run
```bash
# install
cd server && npm install
cd ../client && npm install

# start backend
cd ../server
npm run dev  # http://localhost:5050

# start frontend
cd ../client
npm run dev   # http://localhost:5173
```

## Seed Data
```bash
cd server
npm run seed        # full seed
npm run seed:summary
```
- Seeds demo users and sample files under `server/uploads`.
- Default accounts: `adminHR / Test123!`, `reviewHR / Test123!`, employees `f1_user1 / Test123!` etc.

## File Uploads
- Stored on disk under `server/uploads`
- MongoDB stores file URLs (e.g., `http://localhost:5050/uploads/xxx.pdf`)

## Key Routes
- `/register?token=...` registration
- `/login` login
- `/onboarding` employee onboarding
- `/dashboard` employee portal
- `/hr` HR portal
- `/hr/onboarding/:id` HR onboarding detail

## Notes
- Without SMTP config, emails are logged to console for dev.
- Configure SMTP for real email sending.
