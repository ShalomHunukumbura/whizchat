import React, { useEffect, useState } from "react";
import socket from "../socket";

const Chat: React.FC = () => {
  const [message, setMessage] = useState(""); // Input message
  const [messages, setMessages] = useState<string[]>([]); // Message list

  // Listen for messages
  useEffect(() => {
    const handleMessage = (newMessage: string) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage); // Clean up listener
    };
  }, []);

  // Send a message
  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", message); // Emit to backend
      setMessages((prevMessages) => [...prevMessages, message]); // Update UI immediately
      setMessage(""); // Clear input
    }
  };

  return (
    <div className="flex flex-col w-full h-[400px] border p-4">
      {/* Message Display */}
      <div className="flex-1 overflow-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="p-2 bg-gray-100 mb-2 rounded">
            {msg}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex items-center">
        <input
          type="text"
          className="border p-2 flex-1"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="ml-2 p-2 bg-blue-500 text-white"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
