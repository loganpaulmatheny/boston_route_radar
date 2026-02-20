import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import ProjectsMongoDB from "../db/ProjectsMongoDB.js";

const router = express.Router();

const projectsDB = ProjectsMongoDB();

const DB_NAME = process.env.DB_NAME || "boston-route-radar";
const ISSUES_COLLECTION = process.env.ISSUES_COLLECTION || "issues";

function connectRaw() {
  const URI = process.env.MONGODB_URI;
  if (!URI) throw new Error("MONGODB_URI is missing");
  const client = new MongoClient(URI);
  return client;
}

router.get("/projects", async (req, res) => {
  try {
    const projects = await projectsDB.getAll();

    const client = connectRaw();
    await client.connect();
    try {
      const issues = client.db(DB_NAME).collection(ISSUES_COLLECTION);

      const ids = projects.map((p) => String(p._id));

      // aggregate counts by projectId
      const counts = await issues
        .aggregate([
          { $match: { projectId: { $in: ids } } },
          { $group: { _id: "$projectId", n: { $sum: 1 } } },
        ])
        .toArray();

      const map = new Map(counts.map((c) => [String(c._id), c.n]));

      const enriched = projects.map((p) => ({
        ...p,
        linkedIssues: map.get(String(p._id)) || 0,
      }));

      return res.json({ projects: enriched });
    } finally {
      await client.close();
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.title)
      return res.status(400).json({ error: "title is required" });

    const doc = {
      title: payload.title,
      neighborhoods: Array.isArray(payload.neighborhoods)
        ? payload.neighborhoods
        : [],
      status: payload.status || "planned",
      estCompletion: payload.estCompletion || "",
      imageUrl: payload.imageUrl || "",
    };

    const id = await projectsDB.create(doc);
    return res.status(201).json({ ok: true, _id: String(id) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.put("/projects/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body || {};

    const patch = {
      title: payload.title,
      neighborhoods: Array.isArray(payload.neighborhoods)
        ? payload.neighborhoods
        : [],
      status: payload.status,
      estCompletion: payload.estCompletion,
      imageUrl: payload.imageUrl,
    };

    Object.keys(patch).forEach(
      (k) => patch[k] === undefined && delete patch[k]
    );

    const result = await projectsDB.update(id, patch);
    return res.json({ ok: true, modified: result.modifiedCount });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await projectsDB.remove(id);
    return res.json({ ok: true, deleted: result.deletedCount });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
