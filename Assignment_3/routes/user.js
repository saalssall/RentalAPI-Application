import express from "express";
import argon2 from "argon2";
import authorisation from "../middleware/authorisation.js";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { formatDate, isValidDobFormat, isPastDate } from "../utils/dates.js";
import { hasRequiredFields, isValidStrings } from "../utils/validation.js";
import { decodeToken } from "../middleware/authorisation.js";

const router = express.Router();

// Helpers
// Sends the appropriate 401 error for a bad token.
// Returns true if an error was sent, false if the token is fine.
const sendAuthError = (res, decoded) => {
  const errors = {
    malformed: "Authorization header is malformed",
    expired: "JWT token has expired",
    invalid: "Invalid JWT token",
  };
  if (errors[decoded]) {
    res.status(401).json({ error: true, message: errors[decoded] });
    return true;
  }
  return false;
};

// Shared login logic — only expiresIn differs between /login and /debugLogin
const handleLogin = (expiresIn) => async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!hasRequiredFields(email, password)) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed",
    });
  }

  try {
    const users = await req.db.from("users").where("email", email).select("*");
    if (users.length === 0) {
      return res
        .status(401)
        .json({ error: true, message: "User does not exist" });
    }

    const match = await argon2.verify(users[0].hash, password);
    if (!match) {
      return res
        .status(401)
        .json({ error: true, message: "Passwords do not match" });
    }

    const exp = Math.floor(Date.now() / 1000) + expiresIn;
    const token = jwt.sign({ exp, email }, process.env.JWT_SECRET);
    res.json({ token, tokenType: "Bearer", expiresIn });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /register
router.post("/register", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!hasRequiredFields(email, password)) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed",
    });
  }

  try {
    const existing = await req.db.from("users").where("email", email).first();
    if (existing) {
      return res
        .status(409)
        .json({ error: true, message: "User already exists" });
    }

    const hash = await argon2.hash(password);
    await req.db.from("users").insert({ email, hash });
    res.status(201).json({ success: true, message: "User created" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: true, message: err.message });
  }
});

// POST /login
router.post("/login", handleLogin(60 * 60 * 24));

// POST /debugLogin
router.post("/debugLogin", handleLogin(1));

// GET /:email/profile
router.get("/:email/profile", async (req, res) => {
  const { email } = req.params;
  const decoded = decodeToken(req.headers.authorization);

  // If an auth header was provided but is invalid, reject immediately
  if (req.headers.authorization && sendAuthError(res, decoded)) return;

  try {
    const user = await req.db.from("users").where("email", email).first();
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const isOwner = decoded?.email === email;
    const profile = {
      email: user.email,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      ...(isOwner && {
        dob: formatDate(user.dob),
        address: user.address ?? null,
      }),
    };

    res.status(200).json(profile);
  } catch (err) {
    console.error("GET /profile error:", err);
    res.status(500).json({ error: true, message: "Error in MySQL query" });
  }
});

// PUT /:email/profile
router.put("/:email/profile", authorisation, async (req, res) => {
  const { email } = req.params;
  const { firstName, lastName, dob, address } = req.body ?? {};

  // 1. Decode token (authorisation middleware already verified it,
  //    but we need the payload to check ownership)
  const decoded = decodeToken(req.headers.authorization);
  if (sendAuthError(res, decoded)) return;

  // 2. authorisation middleware already verified and attached the token
  if (req.user.email !== email) {
    return res.status(403).json({ error: true, message: "Forbidden" });
  }

  // 3. Validate body
  if (!hasRequiredFields(firstName, lastName, dob, address)) {
    return res.status(400).json({
      error: true,
      message:
        "Request body incomplete: firstName, lastName, dob and address are required.",
    });
  }
  if (!isValidStrings(firstName, lastName, address)) {
    return res.status(400).json({
      error: true,
      message:
        "Request body invalid: firstName, lastName and address must be strings only.",
    });
  }
  if (!isValidDobFormat(dob)) {
    return res.status(400).json({
      error: true,
      message: "Invalid input: dob must be a real date in format YYYY-MM-DD.",
    });
  }
  if (!isPastDate(dob)) {
    return res.status(400).json({
      error: true,
      message: "Invalid input: dob must be a date in the past.",
    });
  }

  try {
    // 4. Check user exists
    const user = await req.db.from("users").where("email", email).first();
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    // 5. Update profile
    await req.db
      .from("users")
      .where("email", email)
      .update({ firstName, lastName, dob, address });
    res.status(200).json({ email, firstName, lastName, dob, address });
  } catch (err) {
    console.error("PUT /profile error:", err);
    res.status(500).json({ error: true, message: "Error in MySQL query" });
  }
});

export default router;
