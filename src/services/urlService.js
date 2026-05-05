const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const redis = require("../config/redis");
const { encode } = require("../utils/base62");
const clickQueue = require("../queue/clickQueue");

// 🔹 Create short URL
async function createShortUrl(longUrl) {
  // check if already exists
  const existing = await prisma.url.findFirst({
    where: { longUrl }
  });

  if (existing) return existing.shortCode;

  // create new entry
  const newEntry = await prisma.url.create({
    data: { longUrl, shortCode: "" }
  });

  const shortCode = encode(newEntry.id);

  await prisma.url.update({
    where: { id: newEntry.id },
    data: { shortCode }
  });

  return shortCode;
}

// 🔹 Get long URL (with cache)
async function getLongUrl(shortCode) {
  let longUrl;
  let url;

  try {
    const cached = await redis.get(shortCode);

    if (cached) {
      console.log("CACHE HIT");
      longUrl = cached;

      // 🔹 still need DB for id
      url = await prisma.url.findUnique({
        where: { shortCode }
      });
    } else {
      console.log("CACHE MISS");

      url = await prisma.url.findUnique({
        where: { shortCode }
      });

      if (!url) return null;

      longUrl = url.longUrl;

      try {
        await redis.set(shortCode, longUrl);
      } catch (err) { }
    }
  } catch (err) {
    console.log("Redis error, fallback to DB");

    url = await prisma.url.findUnique({
      where: { shortCode }
    });

    if (!url) return null;

    longUrl = url.longUrl;
  }

  // 🔹 ALWAYS track click
  // 🔹 Push click event to queue
  if (url) {
    await clickQueue.add("track-click", {
      urlId: url.id
    });
  }

  return longUrl;
}


module.exports = { createShortUrl, getLongUrl };