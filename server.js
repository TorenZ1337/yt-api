export default {
  async fetch(request) {
    try {
      const CHANNEL_HANDLE = "@sawlties";

      // YouTube-Kanalseite abrufen
      const channelResponse = await fetch(
        `https://www.youtube.com/${CHANNEL_HANDLE}`
      );

      if (!channelResponse.ok) {
        throw new Error(`YouTube returned ${channelResponse.status}`);
      }

      const html = await channelResponse.text();

      // Channel-ID finden
      const patterns = [
        /<meta itemprop="channelId" content="(UC[^"]+)"/,
        /"channelId":"(UC[^"]+)"/,
        /"externalId":"(UC[^"]+)"/
      ];

      let channelId = null;

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
          channelId = match[1];
          break;
        }
      }

      if (!channelId) {
        throw new Error("Channel ID could not be found");
      }

      // YouTube RSS Feed abrufen
      const feedResponse = await fetch(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
      );

      if (!feedResponse.ok) {
        throw new Error(`YouTube RSS returned ${feedResponse.status}`);
      }

      const xml = await feedResponse.text();

      const videoIdMatch = xml.match(
        /<yt:videoId>([^<]+)<\/yt:videoId>/
      );

      if (!videoIdMatch) {
        throw new Error("No video found");
      }

      return new Response(
        `https://www.youtube.com/watch?v=${videoIdMatch[1]}`,
        {
          headers: {
            "Content-Type": "text/plain; charset=UTF-8"
          }
        }
      );

    } catch (error) {
      return new Response(error.message, {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8"
        }
      });
    }
  }
};
