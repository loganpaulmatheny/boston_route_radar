import express from "express";
import MyDB from "../db/MyMongoDB.js";

const router = express.Router();

function escapeRegExp(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Here we are using Router which serves as a mini express app
// Think of this as a ROUTER FILE
// We are keeping our main file clean and modular with a simple call
// app.use("/api/", listingsRouter)

// Think of Express as the main server and router as little modules to get to it
router.get("/issues/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;

  // Add query if the filter has been editted
  const query = {};
  if (req.query.neighborhood) query.neighborhood = req.query.neighborhood;
  if (req.query.category) query.category = req.query.category;

  if (req.query.status) query.status = req.query.status;

  const q = (req.query.query || "").trim();
  if (q) {
    const re = new RegExp(escapeRegExp(q), "i");
    query.$or = [
      { issueText: re },
      { neighborhood: re },
      { category: re },
      { reportedBy: re },
    ];
  }

  if (req.query.projectId) {
    query.projectId = String(req.query.projectId);
  } else if (req.query.unlinked === "true" || req.query.unlinked === "1") {
    query.$or = [
      { projectId: null },
      { projectId: { $exists: false } },
      { projectId: "" },
    ];
  }
  console.log("🏡 Received request for /api/issues", {
    page,
    pageSize,
    query,
  });

  try {
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
    // spread the data to add additional information to the request
    const newIssue = {
      ...req.body,
      status: "open", // default status
      createdAt: new Date(), // NEED FOR SORTING and seeing new ones at the top
      modifiedAt: new Date(),
      comments: [],
      likes: 0,
      projectId: req.body?.projectId ? String(req.body.projectId) : null,
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
router.put("/issues/:id", async (req, res) => {
  const issueId = req.params.id;
  const updatedData = req.body;

  if (Object.prototype.hasOwnProperty.call(updatedData, "projectId")) {
    updatedData.projectId = updatedData.projectId
      ? String(updatedData.projectId)
      : null;
  }

  try {
    const result = await MyDB.updateIssueDB(issueId, updatedData);
    res.json({ message: "Update successful", result });
    console.log(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Get issue counts by mode
router.get("issues/counts", async (req, res) => {
  try {
    const counts = await MyDB.getCategoryCounts();
    res.json({ counts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
