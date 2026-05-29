import express from 'express';
const router = express.Router();

// GET /propertyTypes
router.get('/', async (req, res) => {
    // 1. Reject any unexpected query parameters
    if (Object.keys(req.query).length > 0) {
        return res.status(400).json({
            error: true,
            message: `Invalid query parameters: ${Object.keys(req.query).join(', ')}`
        });
    }

    try {
        // 2. Fetch and return distinct property types
        const rows = await req.db.from("data").distinct("propertyType").orderBy("propertyType");
        res.status(200).json(rows.map(row => row.propertyType));

    } catch (err) {
        console.error("GET /propertyTypes error:", err);
        res.status(500).json({ error: true, message: "Error in MySQL query" });
    }
});

export default router;