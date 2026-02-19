import express from "express";
import issuesRouter from "./routes/issues.js";
// Note this is what the professor refers to as a module

console.log("Initializing the backend...");
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// The .use method is used to serve static files in express
app.use(express.static("frontend"));
// This tells Express: "If someone asks for /assets, look inside the assets folder"
app.use("/assets", express.static("assets"));

// do a get request for the listings
// note the 2 parameters the request and the response
app.use("/api/", issuesRouter);

// This is called BY express
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
