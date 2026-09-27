import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ChatMessage from './ChatMessage';

const LiveChat = () => {
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef(null);
  const messages = useSelector((store) => store.livechat.messages);

  // column-reverse puts newest at the visual bottom, so "at the bottom" is
  // scrollTop near 0.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const onScroll = () => setAutoScroll(container.scrollTop > -10);
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  return (
    <div
      ref={containerRef}
      className="no-scrollbar flex flex-1 flex-col-reverse overflow-y-auto"
    >
      {messages.map((messageData) => (
        <ChatMessage key={messageData.id} messageData={messageData} />
      ))}
    </div>
  );
};

export default LiveChat;
