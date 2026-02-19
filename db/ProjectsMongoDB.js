import { MongoClient, ObjectId } from "mongodb";

function ProjectsMongoDB({
  dbName = "boston-route-radar",
  collectionName = "projects",
} = {}) {
  const me = {};

  const connect = () => {
    const URI = process.env.MONGODB_URI;
    if (!URI) throw new Error("MONGODB_URI is missing");
    const client = new MongoClient(URI);
    const projects = client.db(dbName).collection(collectionName);
    return { client, projects };
  };

  me.getAll = async () => {
    const { client, projects } = connect();
    try {
      return await projects.find({}).sort({ modifiedAt: -1 }).toArray();
    } finally {
      await client.close();
    }
  };

  me.create = async (doc) => {
    const { client, projects } = connect();
    try {
      const now = new Date();
      const result = await projects.insertOne({
        ...doc,
        createdAt: now,
        modifiedAt: now,
      });
      return result.insertedId;
    } finally {
      await client.close();
    }
  };

  me.update = async (id, patch) => {
    const { client, projects } = connect();
    try {
      const _id = new ObjectId(id);
      const result = await projects.updateOne(
        { _id },
        { $set: { ...patch, modifiedAt: new Date() } }
      );
      return result;
    } finally {
      await client.close();
    }
  };

  me.remove = async (id) => {
    const { client, projects } = connect();
    try {
      const _id = new ObjectId(id);
      return await projects.deleteOne({ _id });
    } finally {
      await client.close();
    }
  };

  return me;
}

export default ProjectsMongoDB;
