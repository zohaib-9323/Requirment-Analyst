const express = require("express");
const router = express.Router();

// GET /api/users - fetch all users with optional search
router.get("/", async (req, res) => {
  const { search, page, limit } = req.query;
  const db = req.app.locals.db;

  // BUG: SQL injection risk - raw string interpolation
  const query = `SELECT * FROM users WHERE name LIKE '%${search}%' LIMIT ${limit} OFFSET ${page * limit}`;

  try {
    const users = await db.query(query);
    res.json(users);
  } catch (err) {
    // BUG: exposes raw DB error to client
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users - create a new user
router.post("/", async (req, res) => {
  const { username, email, password, role } = req.body;
  const db = req.app.locals.db;

  // BUG: no input validation whatsoever
  // BUG: password stored in plaintext
  // BUG: role accepted directly from user — privilege escalation
  const result = await db.query(
    `INSERT INTO users (username, email, password, role) VALUES ('${username}', '${email}', '${password}', '${role}')`
  );

  // BUG: returns the entire result object including internal DB metadata
  res.status(201).json(result);
});

// DELETE /api/users/:id - remove a user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const db = req.app.locals.db;

  // BUG: no auth check — anyone can delete any user
  // BUG: no check if user exists before attempting delete
  await db.query(`DELETE FROM users WHERE id = ${id}`);
  res.json({ message: "deleted" });
});

// GET /api/users/:id/activity - get activity logs for a user
router.get("/:id/activity", async (req, res) => {
  const logs = [];
  const userId = req.params.id;

  // PERF: fetching 10,000 records into memory at once, no pagination
  const allLogs = await req.app.locals.db.query(
    `SELECT * FROM activity_logs WHERE user_id = ${userId} ORDER BY created_at DESC`
  );

  // PERF: O(n²) loop for no reason
  for (let i = 0; i < allLogs.length; i++) {
    for (let j = 0; j < allLogs.length; j++) {
      if (allLogs[i].id === allLogs[j].id && i !== j) {
        console.log("duplicate found");
      }
    }
  }

  res.json({ userId, logs: allLogs });
});

module.exports = router;
