// 🔹 LOAD ENV VARIABLES FIRST (VERY IMPORTANT)
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// 🔹 ROUTE IMPORTS
const statutoryRoutes = require("./routes/statutoryRoutes");
const auditRoutes = require("./routes/auditRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();

// 🔹 CONNECT TO MONGODB ATLAS
connectDB();

// 🔹 MIDDLEWARE
app.use(cors());
app.use(express.json());

// 🔹 ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/statutory", statutoryRoutes);
app.use("/api/audit", auditRoutes); // ✅ AUDIT LOG ROUTE ADDED

// 🔹 PORT (LOCAL + DEPLOYMENT SAFE)
const PORT = process.env.PORT || 5000;

// 🔹 START SERVER
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
