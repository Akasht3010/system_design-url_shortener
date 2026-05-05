const { Worker } = require("bullmq");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

let clickBuffer = [];

const worker = new Worker(
  "clicks",
  async (job) => {
    clickBuffer.push(job.data.urlId);

    console.log("Buffered click:", job.data.urlId);
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379
    }
  }
);

// 🔹 Flush every 5 seconds
setInterval(async () => {
  if (clickBuffer.length === 0) return;

  console.log("Flushing batch:", clickBuffer.length);

  const counts = {};

  // count occurrences
  clickBuffer.forEach((id) => {
    counts[id] = (counts[id] || 0) + 1;
  });

  // update DB in batch
  for (const urlId in counts) {
    await prisma.url.update({
      where: { id: Number(urlId) },
      data: {
        clickCount: {
          increment: counts[urlId]
        }
      }
    });

    // optional: insert click records
    await prisma.click.createMany({
      data: Array(counts[urlId]).fill({ urlId: Number(urlId) })
    });
  }

  clickBuffer = [];
}, 5000);

console.log("Batch worker started");