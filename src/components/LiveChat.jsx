import React, { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import { useSelector } from 'react-redux';

const LiveChat = () => {
  const [autoScroll, setAutoScroll] = useState(true);
  const chatContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  const messages = useSelector((store) => store.livechat.messages);

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
      className="h-100 no-scrollbar overflow-y-auto flex flex-col-reverse"
    >
      {messages?.map((messageData) => (
        <ChatMessage key={messageData.id} messageData={messageData} />
      ))}
      <div ref={chatEndRef} /> {/* ✅ scroll marker */}
    </div>
  );
};

export default LiveChat;
