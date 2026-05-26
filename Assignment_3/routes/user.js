import express from "express";
import argon2 from "argon2";
import authorisation from "../middleware/authorisation.js";

import "dotenv/config"; //  correct dotenv import for ES modules
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

router.post("/register", (req, res, next) => {
  // 1. Retrieve email and password from req.body
  const { email, password, firstName, lastName, dob } = req.body ?? {};

  // Verify body
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed",
    });
    return;
  }

  // 2. Determine if user already exists in table
  const queryUsers = req.db
    .from("users")
    .select("*")
    .where("email", "=", email);
  queryUsers
    .then((users) => {
      if (users.length > 0) {
        // 2.1 If user does exist, return error response
        throw new Error("User already exists");
      } else {
        // 2.2 If user does not exist, insert into table
        return argon2.hash(password);
      }
    })
    .then((hash) => {
      return req.db
        .from("users")
        .insert({
          email,
          hash,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          dob: dob ?? null,
        });
    })
    .then(() => {
      res.status(201).json({ success: true, message: "User created" });
    })
    .catch((e) => {
      res.status(500).json({ success: false, message: e.message });
    });
});

router.post("/login", (req, res, next) => {
  const { email, password } = req.body ?? {};

  // 1. Verify email and password are provided
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed",
    });
    return;
  }

  // 2. Determine if user already exists in table
  req.db
    .from("users")
    .select("*")
    .where("email", "=", email)
    .then((users) => {
      if (users.length === 0) {
        // 2.1 If user does not exist, return error response
        res.status(401).json({
          error: true,
          message: "User does not exist",
        });
        throw new Error("User does not exist");
      }

      // 2.2 If user does exist, verify if passwords match
      const { hash } = users[0];
      return argon2.verify(hash, password);
    })
    .then((match) => {
      if (match === undefined) return;

      if (match) {
        // 2.2.1 If passwords match, return JWT
        console.log("Passwords match");
        const expiresIn = 60 * 60 * 24;
        const exp = Math.floor(Date.now() / 1000) + expiresIn;
        const token = jwt.sign({ exp, email }, process.env.JWT_SECRET);
        res.json({
          token,
          tokenType: "Bearer",
          expiresIn,
        });
      } else {
        // 2.2.2 If passwords do not match, return error response
        res.status(401).json({
          error: true,
          message: "Passwords do not match",
        });
      }
    })
    .catch((error) => {
      // Only send response if not already sent
      if (!res.headersSent) {
        res.status(500).json({
          error: true,
          message: error.message,
        });
      }
      console.log("Login error:", error.message);
    });
});

router.post("/debugLogin", (req, res, next) => {
  const { email, password } = req.body ?? {};
  // 1. Verify email and password are provided
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed",
    });
    return;
  }
  // 2. Determine if user already exists in table
  req.db
    .from("users")
    .select("*")
    .where("email", "=", email)
    .then((users) => {
      if (users.length === 0) {
        // 2.1 If user does not exist, return error response
        res.status(401).json({
          error: true,
          message: "User does not exist",
        });
        throw new Error("User does not exist");
      }
      // 2.2 If user does exist, verify if passwords match
      const { hash } = users[0];
      return argon2.verify(hash, password);
    })
    .then((match) => {
      if (match === undefined) return;
      if (match) {
        // 2.2.1 If passwords match, return JWT with 1 second expiry
        console.log("Passwords match");
        const expiresIn = 1;
        const exp = Math.floor(Date.now() / 1000) + expiresIn;
        const token = jwt.sign({ exp, email }, process.env.JWT_SECRET);
        res.json({
          token,
          tokenType: "Bearer",
          expiresIn,
        });
      } else {
        // 2.2.2 If passwords do not match, return error response
        res.status(401).json({
          error: true,
          message: "Passwords do not match",
        });
      }
    })
    .catch((error) => {
      // Only send response if not already sent
      if (!res.headersSent) {
        res.status(500).json({
          error: true,
          message: error.message,
        });
      }
      console.log("Debug login error:", error.message);
    });
});

// Get user profile by email
router.get("/:email/profile", (req, res, next) => {
    const { email } = req.params;

    // Check if authenticated
    const authHeader = req.headers.authorization;
    let authenticatedEmail = null;

    if (authHeader) {
        // If header exists but doesn't start with 'Bearer '
        if (!authHeader.match(/^Bearer /)) {
            res.status(401).json({
                error: true,
                message: "Authorization header is malformed"
            });
            return;
        }

        const token = authHeader.replace(/^Bearer /, "");
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            authenticatedEmail = decoded.email;
        } catch (e) {
            // Invalid token, treat as unauthenticated
        }
    }


  req.db
    .from("users")
    .select("*")
    .where("email", "=", email)
    .then((rows) => {
      if (rows.length === 0) {
        res.status(404).json({
          error: true,
          message: "User not found",
        });
        return;
      }

      const user = rows[0];

      // Format date to YYYY-MM-DD without timezone conversion
      const formatDate = (date) => {
        if (!date) return null;
        if (typeof date === "string") {
          // If it's already in YYYY-MM-DD format, return as is
          if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
          // Otherwise split on T
          return date.split("T")[0];
        }
        // For Date objects, use local time not UTC
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      // If authenticated and matching user, return all fields
      if (authenticatedEmail === email) {
        res.status(200).json({
          email: user.email,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          dob: formatDate(user.dob),
          address: user.address ?? null,
        });
      } else {
        // Unauthenticated or non-matching, return limited fields
        res.status(200).json({
          email: user.email,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: true, message: "Error in MySQL query" });
    });
});

// Update user profile by email (authenticated)
router.put("/:email/profile", authorisation, (req, res, next) => {
    const { email } = req.params;
    const { firstName, lastName, dob, address } = req.body ?? {};

    // 1. Decode token
    const token = req.headers.authorization.replace(/^Bearer /, "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Check if user exists first
    req.db.from("users").select("*").where("email", "=", email)
        .then(rows => {
            if (rows.length === 0) {
                // 2.1 User not found
                res.status(404).json({
                    error: true,
                    message: "User not found"
                });
                return;
            }

            // 2.2 Check authenticated user matches the profile being updated
            if (decoded.email !== email) {
                res.status(403).json({
                    error: true,
                    message: "Forbidden"  
                });
                return;
            }

            // 3. Check all fields are present
            if (!firstName || !lastName || !dob || !address) {
                res.status(400).json({
                    error: true,
                    message: "Request body incomplete: firstName, lastName, dob and address are required.",
                });
                return;
            }

            // 4. Validate string fields
            if (typeof firstName !== "string" || typeof lastName !== "string" || typeof address !== "string") {
                res.status(400).json({
                    error: true,
                    message: "Request body invalid: firstName, lastName and address must be strings only.",
                });
                return;
            }

            // 5. Validate dob format YYYY-MM-DD
            const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dobRegex.test(dob)) {
                res.status(400).json({
                    error: true,
                    message: "Invalid input: dob must be a real date in format YYYY-MM-DD.",
                });
                return;
            }

            // 6. Validate dob is a real date
            const [year, month, day] = dob.split("-").map(Number);
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
                res.status(400).json({
                    error: true,
                    message: "Invalid input: dob must be a real date in format YYYY-MM-DD.",
                });
                return;
            }

            // 7. Validate dob is in the past
            if (date >= new Date()) {
                res.status(400).json({
                    error: true,
                    message: "Invalid input: dob must be a date in the past.",
                });
                return;
            }

            // 8. Update the user profile
            return req.db.from("users").where("email", "=", email)
                .update({ firstName, lastName, dob, address })
                .then(() => {
                    res.status(200).json({ email, firstName, lastName, dob, address });
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: true, message: "Error in MySQL query" });
        });
});


// 401 to do: "message": "Authorization header ('Bearer token') not found"
export default router;
