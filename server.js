"use strict";

const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;
const publicDir = __dirname;

app.set("etag", "strong");
app.disable("x-powered-by");

app.use(
  express.static(publicDir, {
    extensions: ["html"],
    maxAge: "1h",
    setHeaders: (res, filePath) => {
      if (path.extname(filePath) === ".html") {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Fallback to index.html for client-side routes
app.get("*", (req, res, next) => {
  if (req.path.includes(".")) return next();
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, () => {
  console.log(`AR Code-Verse server listening on port ${port}`);
}); 