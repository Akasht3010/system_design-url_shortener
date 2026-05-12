const { createShortUrl, getLongUrl } = require("../services/urlService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

    // group clicks by date
    const grouped = {};

    url.clicks.forEach(click => {
      const date = click.timestamp.toISOString().split("T")[0];

      grouped[date] = (grouped[date] || 0) + 1;
    });

    const clicksByDate = Object.entries(grouped).map(([date, count]) => ({
      date,
      count
    }));

    res.json({
      shortCode: code,
      longUrl: url.longUrl,
      totalClicks: url.clickCount,
      createdAt: url.createdAt,
      clicksByDate
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).send("Internal Server Error");
  }
};