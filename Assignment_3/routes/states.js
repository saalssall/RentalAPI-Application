import express from 'express';
const router = express.Router();

// GET /states
router.get('/', async (req, res) => {
    // 1. Reject any unexpected query parameters
    if (Object.keys(req.query).length > 0) {
        return res.status(400).json({
            error: true,
            message: `Invalid query parameters: ${Object.keys(req.query).join(', ')}`
        });
    }

    try {
        // 2. Fetch and return distinct states
        const rows = await req.db.from("data").distinct("state").orderBy("state");
        res.status(200).json(rows.map(row => row.state));

    } catch (err) {
        console.error("GET /states error:", err);
        res.status(500).json({ error: true, message: "Error in MySQL query" });
    }
});

export default router;