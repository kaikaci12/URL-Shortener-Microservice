const isValidUrl = (url) => {
  try {
    new URL(url); // Throws an error if the URL is invalid
    return true;
  } catch (error) {
    return false;
  }
};

const validateUrl = (req, res, next) => {
  const { url } = req.body;
  if (url && !isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL format" });
  }
  next();
};

module.exports = validateUrl;
