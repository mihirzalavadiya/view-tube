import React, { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { addMessage } from '@/redux/slice/liveChatSlice';

const LiveChat = () => {
  const dispatch = useDispatch();
  const [autoScroll, setAutoScroll] = useState(true);
  const chatContainerRef = useRef(null); // scrollable container
  const chatEndRef = useRef(null); // end marker
  const router = useRouter();
  const messages = useSelector((store) => store.livechat.messages);
  const { v } = router.query;
  const videoId = v || 'wKX4SSDc1ZA'; // fallback

  useEffect(() => {
    const fetchLiveChat = async () => {
      try {
        const res = await fetch(`/api/livechat?videoId=${videoId}`);
        const data = await res.json();
        console.log(data);
        if (Array.isArray(data?.items)) {
          data.items.forEach((item) => {
            const authorDetails = item?.authorDetails;
            const snippet = item?.snippet;

            const avatar = authorDetails?.profileImageUrl;
            const username = authorDetails?.displayName;
            const message =
              snippet?.displayMessage ||
              snippet?.textMessageDetails?.messageText;
            const timestamp = new Date(snippet?.publishedAt);
            const isOwner = authorDetails?.isChatOwner;
            const isModerator = authorDetails?.isChatModerator;
            const isSponsor = authorDetails?.isChatSponsor;
            const isVerified = authorDetails?.isVerified;

            dispatch(
              addMessage({
                id: item.id,
                avatar,
                username,
                message,
                timestamp,
                isOwner,
                isModerator,
                isSponsor,
                isVerified,
              })
            );
          });
        }
      } catch (error) {
        console.error('Error fetching live chat:', error);
      }
    };

    fetchLiveChat();
    const interval = setInterval(() => {
      fetchLiveChat();
    }, 2000);

    return () => clearInterval(interval);
  }, [videoId, dispatch]);

  // Track scroll position (to know if user scrolled up)
  useEffect(() => {
    const container = chatContainerRef.current;

    const handleScroll = () => {
      if (!container) return;
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 10;
      setAutoScroll(isAtBottom);
    };

    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto scroll when new message comes
  useEffect(() => {
    if (autoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, autoScroll]);

  return (
    <div
      ref={chatContainerRef} // ✅ scrollable container
      className="h-100 no-scrollbar overflow-y-auto"
    >
      {messages?.map((messageData) => (
        <ChatMessage key={messageData.id} messageData={messageData} />
      ))}
      <div ref={chatEndRef} /> {/* ✅ scroll marker */}
    </div>
  );
};

export default LiveChat;
