import express from "express";
import issuesRouter from "./routes/issues.js";
import adminRouter from "./routes/admin.js";

console.log("Initializing the backend...");
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// serve frontend static files
app.use(express.static("frontend"));

// APIs
app.use("/api/", issuesRouter);
app.use("/api/", adminRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
