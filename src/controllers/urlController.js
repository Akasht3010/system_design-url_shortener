const { createShortUrl, getLongUrl } = require("../services/urlService");

exports.shorten = async (req, res) => {
  try {
    const { longUrl } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: "longUrl is required" });
    }

    const shortCode = await createShortUrl(longUrl);

    // const shortCode = await createShortUrl(url);

    res.json({
      shortUrl: `http://localhost:3000/${shortCode}`
    });
  } catch (err) {
    console.error("SHORTEN ERROR:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.redirect = async (req, res) => {
  try {
    const { code } = req.params;

    const longUrl = await getLongUrl(code);

    if (!longUrl) return res.status(404).send("Not found");

    res.redirect(longUrl);
  } catch (err) {
    console.error("REDIRECT ERROR:", err);
    res.status(500).send("Internal Server Error");
  }
};