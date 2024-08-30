require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const dns = require("dns");
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/FreeCodeCamp", {
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to the database"))
  .catch((e) => console.log(e));
app.use(express.json());
const Url = require("./models/Url"); // Import the Url model
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: false }));
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(404).send("No Url Provided");
  }
  const hostname = new URL(url).hostname;

  dns.lookup(hostname, async (err, address, family) => {
    if (err) {
      return res.status(401).json({ error: "invalid url" });
    }
    const findUrl = await Url.findOne({ originalUrl: url });
    if (findUrl) {
      return res.status(200).json({
        originalUrl: url,
        shortUrl: parseInt(findUrl.shortUrl),
      });
    }
    const shortUrl = Math.floor(Math.random() * 1000000);
    const newUrl = await Url.create({
      originalUrl: url,
      shortUrl: parseInt(shortUrl),
    });

    res.status(200).json({
      original_url: url,
      short_url: parseInt(newUrl.shortUrl),
    });
  });
});
app.get("/api/shorturl/:short_url", async (req, res) => {
  const { short_url } = req.params;

  if (!short_url) {
    return res.status(400).json({ error: "invalid uRL" });
  }

  try {
    const urlEntry = await Url.findOne({ shortUrl: short_url });

    if (!urlEntry) {
      return res.status(404).json({ error: "Could not find the original URL" });
    }

    return res.status(302).redirect(urlEntry.originalUrl);
  } catch (error) {
    console.error("Error finding URL:", error);
    return res.status(500).json({ error: "invalid url" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
