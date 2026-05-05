const { createShortUrl, getLongUrl } = require("../services/urlService");

exports.shorten = async (req, res) => {
  try {
    const { url } = req.body;

    const shortCode = await createShortUrl(url);

    res.json({
      shortUrl: `http://${req.headers.host}/${shortCode}`
    });
  } catch (err) {
    console.error("SHORTEN ERROR:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.redirect = async (req, res) => {
  try {
    const { code } = req.params;

    console.log("REDIRECT HIT:", code); // 👈 ADD THIS

    const longUrl = await getLongUrl(code);

    console.log("LONG URL:", longUrl); // 👈 ADD THIS

    if (!longUrl) return res.status(404).send("Not found");

    res.redirect(longUrl);
  } catch (err) {
    console.error("REDIRECT ERROR:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { code } = req.params;

    const url = await prisma.url.findUnique({
      where: { shortCode: code },
      include: {
        clicks: {
          orderBy: { timestamp: "desc" },
          take: 10
        }
      }
    });

    if (!url) return res.status(404).json({ error: "Not found" });

    res.json({
      shortCode: code,
      longUrl: url.longUrl,
      totalClicks: url.clickCount,
      createdAt: url.createdAt,
      recentClicks: url.clicks
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).send("Internal Server Error");
  }
};