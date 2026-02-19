import { MongoClient, ObjectId } from "mongodb";

function MyMongoDB({
  dbName = "boston-route-radar",
  collectionName = "issues",
  defaultUri = "mongodb://localhost:27017",
} = {}) {
  const me = {};
  // const URI = process.env.MONGODB_URI || defaultUri;
  const URI = process.env.MONGODB_URI;

  const connect = () => {
    console.log("Connecting to MongoDB at", URI);
    const client = new MongoClient(URI);
    const issues = client.db(dbName).collection(collectionName);

    return { client, issues };
  };

  me.getIssues = async ({ query = {}, pageSize = 20, page = 1 } = {}) => {
    const { client, issues } = connect();

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
    } finally {
      await client.close();
    }
  };

  me.createIssue = async (issue) => {
    const { client, issues } = connect();
    try {
      const result = await issues.insertOne(issue);
      return result;
    } catch (err) {
      console.error("Error inserting issue into MongoDB", err);
      throw err;
    } finally {
      await client.close();
    }
  };

  me.removeIssue = async (issueId) => {
    const { client, issues } = connect();
    try {
      const filter = { _id: new ObjectId(issueId) };
      const result = await issues.deleteOne(filter);
      return result;
    } catch (err) {
      console.error("Error deleting issue from the DB", err);
      throw err;
    } finally {
      await client.close();
    }
  };

  me.updateIssueDB = async (issueId, updatedData) => {
    const { client, issues } = connect();
    try {
      const filter = { _id: new ObjectId(issueId) };
      const updateDoc = {
        $set: {
          ...updatedData,
          modifiedAt: new Date(),
        },
      };

      const result = await issues.updateOne(filter, updateDoc);
      return result;
    } catch (err) {
      console.error("MongoDB Update Error:", err);
      throw err;
    } finally {
      await client.close();
    }
  };
  return me;
}

const myMongoDB = MyMongoDB();
export default myMongoDB;
