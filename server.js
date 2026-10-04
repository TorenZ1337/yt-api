const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const CHANNEL_HANDLE = "@sawlties";

async function getChannelId() {
  const response = await fetch(
    `https://www.youtube.com/${CHANNEL_HANDLE}`
  );

  if (!response.ok) {
    throw new Error(`YouTube returned ${response.status}`);
  }

  const html = await response.text();

  const patterns = [
    /<meta itemprop="channelId" content="(UC[^"]+)"/,
    /"channelId":"(UC[^"]+)"/,
    /"externalId":"(UC[^"]+)"/
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match) {
      return match[1];
    }
  }

  throw new Error("Channel ID could not be found");
}

app.get("/", async (req, res) => {
  try {
    const channelId = await getChannelId();

    const response = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    );

    if (!response.ok) {
      throw new Error(`YouTube RSS returned ${response.status}`);
    }

    const xml = await response.text();

    const videoIdMatch = xml.match(
      /<yt:videoId>([^<]+)<\/yt:videoId>/
    );

    if (!videoIdMatch) {
      throw new Error("No video found");
    }

    res
      .type("text")
      .send(`https://www.youtube.com/watch?v=${videoIdMatch[1]}`);

  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
