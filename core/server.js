#!/usr/bin/env node
import express from "express";
import mongoose from "mongoose";
import routes from "./routers/index.js";

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/talasea-corewallet";

app.use(express.json());


app.get("/health", (req, res) => {
  res.send("healthy");
});

app.use("/api/v1/", routes);

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();

