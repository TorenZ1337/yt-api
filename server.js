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

  const match = html.match(/"channelId":"(UC[^"]+)"/);

  if (!match) {
    throw new Error("Channel ID could not be found");
  }

  return match[1];
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

    res.type("text").send(
      `https://www.youtube.com/watch?v=${videoIdMatch[1]}`
    );

  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting latest YouTube video");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
