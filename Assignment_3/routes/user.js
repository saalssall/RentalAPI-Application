import express from 'express';
import argon2 from 'argon2';

import 'dotenv/config'; //  correct dotenv import for ES modules
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();

router.post('/register', (req, res, next) => {
  // 1. Retrieve email and password from req.body
  const { email, password } = req.body ?? {};

  // Verify body
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed"
    });
    return;
  }

  // 2. Determine if user already exists in table
  const queryUsers = req.db.from("users").select("*").where("email", "=", email);
  queryUsers.then(users => {
    if (users.length > 0) {
      // 2.1 If user does exist, return error response
      throw new Error("User already exists");
    } else {
      // 2.2 If user does not exist, insert into table
      return argon2.hash(password);
    }
  })
  .then(hash => {
    return req.db.from("users").insert({ email, hash });
  })
  .then(() => {
    res.status(201).json({ success: true, message: "User created" });
  })
  .catch(e => {
    res.status(500).json({ success: false, message: e.message });
  });
});

router.post('/login', (req, res, next) => {
    const { email, password } = req.body ?? {};

    // 1. Verify email and password are provided
    if (!email || !password) {
        res.status(400).json({
            error: true,
            message: "Request body incomplete - email and password needed"
        });
        return;
    }

    // 2. Determine if user already exists in table
    req.db.from("users").select("*").where("email", "=", email)
        .then(users => {
            if (users.length === 0) {
                // 2.1 If user does not exist, return error response
                res.status(401).json({
                    error: true,
                    message: "User does not exist"
                });
                throw new Error("User does not exist");
            }

            // 2.2 If user does exist, verify if passwords match
            const { hash } = users[0];
            return argon2.verify(hash, password);
        })
        .then(match => {
            if (match === undefined) return;

            if (match) {
                // 2.2.1 If passwords match, return JWT
                console.log("Passwords match");
                const expiresIn = 60 * 60 * 24;
                const exp = Math.floor(Date.now() / 1000) + expiresIn;
                const token = jwt.sign({ exp }, process.env.JWT_SECRET);
                res.json({
                    token,
                    tokenType: "Bearer",
                    expiresIn
                });
            } else {
                // 2.2.2 If passwords do not match, return error response
                res.status(401).json({
                    error: true,
                    message: "Passwords do not match"
                });
            }
        })
        .catch(error => {
            // Only send response if not already sent
            if (!res.headersSent) {
                res.status(500).json({
                    error: true,
                    message: error.message
                });
            }
            console.log("Login error:", error.message);
        });
});

router.post('/debugLogin', (req, res, next) => {
    const { email, password } = req.body ?? {};
    // 1. Verify email and password are provided
    if (!email || !password) {
        res.status(400).json({
            error: true,
            message: "Request body incomplete - email and password needed"
        });
        return;
    }
    // 2. Determine if user already exists in table
    req.db.from("users").select("*").where("email", "=", email)
        .then(users => {
            if (users.length === 0) {
            // 2.1 If user does not exist, return error response
                res.status(401).json({
                    error: true,
                    message: "User does not exist"
                });
                throw new Error("User does not exist");
            }
            // 2.2 If user does exist, verify if passwords match
            const { hash } = users[0];
            return argon2.verify(hash, password);
        })
        .then(match => {
            if (match === undefined) return;
            if (match) {
            // 2.2.1 If passwords match, return JWT with 1 second expiry
                console.log("Passwords match");
                const expiresIn = 1;
                const exp = Math.floor(Date.now() / 1000) + expiresIn;
                const token = jwt.sign({ exp }, process.env.JWT_SECRET);
                res.json({
                    token,
                    tokenType: "Bearer",
                    expiresIn
                });
            } else {
            // 2.2.2 If passwords do not match, return error response
                res.status(401).json({
                    error: true,
                    message: "Passwords do not match"
                });
            }
        })
        .catch(error => {
            // Only send response if not already sent
            if (!res.headersSent) {
                res.status(500).json({
                    error: true,
                    message: error.message
                });
            }
            console.log("Debug login error:", error.message);
        });
});

export default router;