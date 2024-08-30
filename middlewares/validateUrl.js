const isValidUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch (error) {
    return false;
  }
};

const validateUrl = (req, res, next) => {
  const { url } = req.body;
  if (url && !isValidUrl(url)) {
    return res.status(400).json({ error: "invalid url" });
  }
  next();
};

module.exports = validateUrl;
