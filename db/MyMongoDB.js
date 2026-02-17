import { MongoClient, ObjectId } from "mongodb";

function MyMongoDB({
  dbName = "boston-route-radar",
  collectionName = "issues",
  defaultUri = "mongodb://localhost:27017",
} = {}) {
  const me = {};
  const URI = process.env.MONGODB_URI || defaultUri;

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

  me.updateIssue = async (issueId, updatedData) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        // close the modal
        const upModal = document.getElementById("updateModal");
        const modalInstance = window.bootstrap.Modal.getInstance(upModal);
        if (modalInstance) modalInstance.hide();

        // Refresh the UI
        me.refreshIssues();
      } else {
        alert("Failed to update issue on the server.");
      }
    } catch (err) {
      console.error("Network error during update:", err);
    }
  };
  return me;
}

const myMongoDB = MyMongoDB();
export default myMongoDB;
