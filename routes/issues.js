import express from "express";
// import MyDB from "../db/MyMongoDB.js";

const router = express.Router();

// Here we are using Router which serves as a mini express app
// Think of this as a ROUTER FILE
// We are keeping our main file clean and modular with a simple call
// app.use("/api/", listingsRouter)

// Think of Express as the main server and router as little modules to get to it
router.get("/issues/", async (req, res) => {
  // const page = parseInt(req.query.page) || 1;
  // const pageSize = parseInt(req.query.pageSize) || 20;
  // const query = {};
  // console.log("🏡 Received request for /api/listings", {
  //   page,
  //   pageSize,
  //   query,
  // });

  try {
    console.log("Hello world");
    // const listings = await MyDB.getListings({ query, pageSize, page });
    // res.json({
    //   listings,
    // });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Internal Server Error", listings: [] });
  }
});

export default router;
