import { GET_LIVE_CHAT_ID, GET_LIVE_CHAT } from '@/utils/constants';

export default async function handler(req, res) {
  try {
    const { videoId } = req.query;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const chatIdResponse = await fetch(`${GET_LIVE_CHAT_ID}&id=${videoId}`);
    if (!chatIdResponse.ok) {
      const errText = await chatIdResponse.text();
      throw new Error(
        `YouTube API error (liveChatId fetch): ${chatIdResponse.status} - ${errText}`
      );
    }

    const chatIdData = await chatIdResponse.json();
    const liveChatId =
      chatIdData.items?.[0]?.liveStreamingDetails?.activeLiveChatId;

    if (!liveChatId) {
      return res
        .status(404)
        .json({ error: 'Live chat not found for this video' });
    }

    const chatUrl = GET_LIVE_CHAT.replace('LIVE_CHAT_ID', liveChatId);
    const chatResponse = await fetch(chatUrl);

    if (!chatResponse.ok) {
      const errText = await chatResponse.text();
      throw new Error(
        `YouTube API error (liveChat fetch): ${chatResponse.status} - ${errText}`
      );
    }

    const chatData = await chatResponse.json();

    res.status(200).json(chatData);
  } catch (error) {
    console.error('YouTube Live Chat API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch live chat messages' });
  }
}
