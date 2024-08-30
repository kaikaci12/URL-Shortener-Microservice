require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const mongoose = require("mongoose");
const Url = require("./models/Url"); // Import the Url model
const validateUrl = require("./middlewares/validateUrl"); // Import the middleware

const app = express();
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/FreeCodeCamp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to the database"))
  .catch((e) => console.log(e));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// POST /api/shorturl route
app.post("/api/shorturl", validateUrl, async (req, res) => {
  const { url } = req.body;

  const hostname = new URL(url).hostname;

  try {
    dns.lookup(hostname, async (err) => {
      if (err) {
        return res.status(400).json({ error: "Invalid URL" });
      }

      // Check if URL already exists
      const existingUrl = await Url.findOne({ originalUrl: url });
      if (existingUrl) {
        return res.status(200).json({
          original_url: url,
          short_url: existingUrl.shortUrl,
        });
      }

      // Generate a unique short URL
      const shortUrl = Math.floor(Math.random() * 1000000).toString();
      const newUrl = await Url.create({
        originalUrl: url,
        shortUrl: shortUrl,
      });

      res.status(200).json({
        original_url: url,
        short_url: newUrl.shortUrl,
      });
    });
  } catch (error) {
    console.error("Error processing URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/shorturl/:short_url route
app.get("/api/shorturl/:short_url", async (req, res) => {
  const { short_url } = req.params;

  if (!short_url) {
    return res.status(400).json({ error: "Invalid short URL" });
  }

  try {
    const urlEntry = await Url.findOne({ shortUrl: short_url });

    if (!urlEntry) {
      return res.status(404).json({ error: "URL not found" });
    }

    res.redirect(urlEntry.originalUrl);
  } catch (error) {
    console.error("Error finding URL:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
