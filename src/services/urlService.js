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
  try {
    const cached = await redis.get(shortCode);
    if (cached) {
      console.log("CACHE HIT");

      // ❗ Still need DB for click tracking
      const url = await prisma.url.findUnique({
        where: { shortCode }
      });

      if (url) {
        await prisma.url.update({
          where: { id: url.id },
          data: { clickCount: { increment: 1 } }
        });

        await prisma.click.create({
          data: { urlId: url.id }
        });
      }

      return cached;
    }
  } catch (err) {
    console.log("Redis error, fallback to DB");
  }

  console.log("CACHE MISS");

  const url = await prisma.url.findUnique({
    where: { shortCode }
  });

  if (!url) return null;

  // ✅ Track click
  await prisma.url.update({
    where: { id: url.id },
    data: { clickCount: { increment: 1 } }
  });

  await prisma.click.create({
    data: { urlId: url.id }
  });

  try {
    await redis.set(shortCode, url.longUrl);
  } catch (err) {}

  return url.longUrl;
}


module.exports = { createShortUrl, getLongUrl };