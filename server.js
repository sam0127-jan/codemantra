// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// __dirname setup (ESM fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "views")));

// ✅ Root route (index.html नसेल तरी चालेल)
app.get("/", (req, res) => {
  res.send(`
    <h1>🚀 Codemantra Auth Server Running Successfully</h1>
    <p><a href="/signup.html">Signup</a> | <a href="/signin.html">Signin</a></p>
  `);
});

// ======================
// 🔐 MongoDB Model Setup
// ======================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// ======================
// 📝 Routes
// ======================

// Signup Route
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).send("Signup successful ✅");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Server error during signup");
  }
});

// Signin Route
app.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send("User not found ❌");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials ❌");

    res.send("Login successful ✅");
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).send("Server error during signin");
  }
});

// ======================
// 🚀 MongoDB Connection
// ======================
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
