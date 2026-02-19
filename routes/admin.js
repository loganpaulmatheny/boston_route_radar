import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function mustHaveEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function makeClient() {
  const uri = mustHaveEnv("MONGODB_URI");
  return new MongoClient(uri);
}

// allow overrides, but sensible defaults
const DB_NAME = process.env.DB_NAME || "boston-route-radar";
const PROJECTS_COLLECTION = process.env.PROJECTS_COLLECTION || "projects";

router.post("/admin/seed-projects", async (req, res) => {
  const client = makeClient();
  await client.connect();

  try {
    const db = client.db(DB_NAME);

    // 1) Check if collection exists
    const collections = await db
      .listCollections({ name: PROJECTS_COLLECTION })
      .toArray();

    const exists = collections.length > 0;

    // 2) If exists, check if it has data
    if (exists) {
      const count = await db.collection(PROJECTS_COLLECTION).countDocuments();

      if (count > 0) {
        return res.json({
          seeded: false,
          reason: "Collection exists and has records",
          count,
        });
      }
    }

    // 3) If collection missing or empty, load JSON and insert
    const jsonPath = path.resolve(__dirname, "../data/projects.json");
    const raw = await fs.readFile(jsonPath, "utf-8");
    const projects = JSON.parse(raw);

    if (!Array.isArray(projects)) {
      return res
        .status(400)
        .json({ error: "data/projects.json must contain a JSON array" });
    }

    const normalizeStatus = (s) => {
      const v = String(s || "")
        .trim()
        .toLowerCase();
      if (v === "planned") return "planned";
      if (v === "in progress" || v === "in_progress") return "in_progress";
      if (v === "completed") return "completed";
      return "planned";
    };

    const now = new Date();

    const docs = projects.map((p) => {
      const createdAt = p.createdAt ? new Date(p.createdAt) : now;
      const modifiedAt = p.lastUpdated
        ? new Date(p.lastUpdated)
        : p.modifiedAt
          ? new Date(p.modifiedAt)
          : now;

      const doc = {
        ...(typeof p._id === "string" && /^[a-fA-F0-9]{24}$/.test(p._id)
          ? { _id: new ObjectId(p._id) }
          : {}),

        title: p.title || p.projectText || "",
        neighborhoods: Array.isArray(p.neighborhoods)
          ? p.neighborhoods
          : p.neighborhood
            ? [p.neighborhood]
            : [],

        status: normalizeStatus(p.status || p.Status),
        estCompletion: p.estCompletion || p.estimatedCompletionDate || "",
        imageUrl: p.imageUrl || p.projectPicture || "",

        createdAt,
        modifiedAt,
      };

      return doc;
    });

    const result = await db
      .collection(PROJECTS_COLLECTION)
      .insertMany(docs, { ordered: false });

    return res.json({
      seeded: true,
      reason: exists
        ? "Collection existed but was empty"
        : "Collection did not exist",
      count: result.insertedCount,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  } finally {
    await client.close();
  }
});

export default router;
