import { MongoClient, ObjectId } from "mongodb";

function MyMongoDB({
  dbName = "boston-route-radar",
  collectionName = "issues",
} = {}) {
  const me = {};
  const URI = process.env.MONGODB_URI;

  const client = new MongoClient(URI);
  let collection = null;

  // Change this to an async function to stop Mongo from creating a new client every function
  const connect = async () => {
    if (!collection) {
      await client.connect();
      collection = client.db(dbName).collection(collectionName);
    }
    return collection;
  };

  me.getIssues = async ({ query = {}, pageSize = 20, page = 1 } = {}) => {
    const issues = await connect();
    try {
      const data = await issues
        .find(query)
        .sort({ modifiedAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .toArray();
      console.log("📈 Fetched issues from MongoDB", data.length);
      return data;
    } catch (err) {
      console.error("Error fetching issues from MongoDB", err);
      throw err;
    }
  };

  me.createIssue = async (issue) => {
    const issues = await connect();
    try {
      return await issues.insertOne(issue);
    } catch (err) {
      console.error("Error inserting issue into MongoDB", err);
      throw err;
    }
  };

  me.removeIssue = async (issueId) => {
    const issues = await connect();
    try {
      return await issues.deleteOne({ _id: new ObjectId(issueId) });
    } catch (err) {
      console.error("Error deleting issue from the DB", err);
      throw err;
    }
  };

  me.updateIssueDB = async (issueId, updatedData) => {
    const issues = await connect();
    try {
      return await issues.updateOne(
        { _id: new ObjectId(issueId) },
        { $set: { ...updatedData, modifiedAt: new Date() } },
      );
    } catch (err) {
      console.error("MongoDB Update Error:", err);
      throw err;
    }
  };

  me.getCategoryCounts = async () => {
    const issues = await connect();
    try {
      // do an aggregation function within the database
      const data = await issues
        .aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }])
        .toArray();
      return data;
    } catch (err) {
      console.error("Error fetching category counts", err);
      throw err;
    }
  };

  return me;
}

const myMongoDB = MyMongoDB();
export default myMongoDB;
