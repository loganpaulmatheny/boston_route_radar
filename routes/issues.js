import express from "express";
import MyDB from "../db/MyMongoDB.js";

const router = express.Router();

// Here we are using Router which serves as a mini express app
// Think of this as a ROUTER FILE
// We are keeping our main file clean and modular with a simple call
// app.use("/api/", listingsRouter)

// Think of Express as the main server and router as little modules to get to it
router.get("/issues/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const query = {};
  console.log("🏡 Received request for /api/issues", {
    page,
    pageSize,
    query,
  });

  try {
    console.log("Hello world");
    const issues = await MyDB.getIssues({ query, pageSize, page });
    res.json({
      issues,
    });
  } catch (error) {
    console.error("Error fetching issues:", error);
    res.status(500).json({ error: "Internal Server Error", issues: [] });
  }
});

// POST: Create a new issue
router.post("/issues/", async (req, res) => {
  console.log(req.body);
  try {
    const newIssue = {
      ...req.body,
      status: "Open", // Default status
      createdAt: new Date(), // Important for sorting
      modifiedAt: new Date(),
      comments: [],
      likes: 0,
    };
    console.log(newIssue);
    const result = await MyDB.createIssue(newIssue);
    console.log(result);
    res.status(201).json(result);
    console.log("success");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Delete the issue
router.delete("/issues/:id", async (req, res) => {
  const issueId = req.params.id;
  try {
    const result = await MyDB.removeIssue(issueId);

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res.status(404).json({ error: "Issue not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update the issue
// TODO: Start back here and fix this
router.put("/issues/:id", async (req, res) => {
  const issueId = req.params.id;
  const updatedData = req.body;

  try {
    const result = await MyDB.updateIssueDB(issueId, updatedData);
    res.json({ message: "Update successful", result });
    console.log(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
