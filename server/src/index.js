import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static('src/uploads'));

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Hiring Management System API' });
});

// TODO: Add route imports here
// import authRoutes from './routes/authRoutes.js';
// import employeeRoutes from './routes/employeeRoutes.js';
// import hrRoutes from './routes/hrRoutes.js';

// app.use('/api/auth', authRoutes);
// app.use('/api/employee', employeeRoutes);
// app.use('/api/hr', hrRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
