import React, { useEffect, useState, useRef } from "react";
import socket from "../socket";
import axios from "axios";

interface Message {
  text: string;
  user: string;
  timestamp: string;
}

interface ChatProps {
  user: {
    displayName: string | null;
    email: string | null;
    uid: string;
  };
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [message, setMessage] = useState(""); // Input message
  const [messages, setMessages] = useState<Message[]>([]); // Message list
  const [unreadMessages, setUnreadMessages] = useState(0); // Unread message count
  const chatContainerRef = useRef<HTMLDivElement>(null); // Ref for the chat container
  const [isTyping, setIsTyping] = useState<string>(""); // Typing indicator state

  // Fetch previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:5000/messages");
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages: ", error);
      }
    };
    fetchMessages();
  }, []);

  // Listen for new messages
  useEffect(() => {
    const handleMessage = (newMessage: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Check if user is scrolled to the bottom
      if (
        chatContainerRef.current &&
        chatContainerRef.current.scrollTop + chatContainerRef.current.clientHeight < chatContainerRef.current.scrollHeight
      ) {
        setUnreadMessages((prev) => prev + 1); // Increment unread message count
      }
    };

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage); // Clean up listener
    };
  }, []);

  // Listen for typing events
  useEffect(() => {
    const handleTyping = (username: string) => {
      setIsTyping(`${username} is typing...`);
    };

    const handleStopTyping = () => {
      setIsTyping("");
    };

    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);

    return () => {
      socket.off("userTyping", handleTyping); // Clean up listener
      socket.off("userStoppedTyping", handleStopTyping);
    };
  }, []);

  // Scroll to the bottom when clicking the badge
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setUnreadMessages(0); // Clear unread messages
    }
  };

  // Automatically scroll to the bottom when `messages` updates
  useEffect(() => {
    if (
      chatContainerRef.current &&
      chatContainerRef.current.scrollTop + chatContainerRef.current.clientHeight >= chatContainerRef.current.scrollHeight
    ) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send a message
  const sendMessage = () => {
    if (message.trim()) {
      const username = user.displayName || "Anonymous";
      const timestamp = new Date().toISOString();
      const newMessage: Message = { user: username, text: message, timestamp };

      socket.emit("sendMessage", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage(""); // Clear input

      // Scroll to the bottom when a message is sent
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  };

  // Notify typing event
  const handleTyping = () => {
    socket.emit("userTyping", user.displayName);
  };

  // Notify stop typing event
  const handleStopTyping = () => {
    socket.emit("userStoppedTyping", user.displayName);
  };

  // Format timestamps for display
  const formatTimestamp = (timestamp: string) => {
    const localTime = new Date(timestamp);
    return new Intl.DateTimeFormat("en-us", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(localTime);
  };

  return (
    <div className="flex flex-col h-full max-h-[95vh] bg-blue-200 rounded-lg shadow-lg">
      {/*header */}
      <div
        className="flex items-center justify-between p-4 bg-blue-900 text-white rounded-t-lg"
        >
          <div>
            <h3 className="font-bold">{user.displayName}</h3>
            <span className="text-sm">Online</span>
          </div>
      </div>
      <div className="flex space-x-4">
        <button className="text-white hover:bg-green-400 p-2 rounded-full">
          <i className="fa fa-search"></i>
        </button>
        <button className="text-white hover:bg-green-400 p-2 rounded-full"><i className="fa fa-cog"></i></button>
      </div>

      {/* Message Display */}
      <div className="flex-1 overflow-auto p-4 space-y-4" ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <div 
              key={index} 
              className={`flex ${msg.user === user.displayName ? "justify-end" : "justify-start"}`}>

                <div className={` max-w-xs p-3 rounded-lg ${msg.user === user.displayName ? "bg-blue-500 mr-2 text-white" : "bg-blue-300 mr-2 text-black"}`}>

                <strong className="font-semibold">{msg.user}</strong>
                  <p>{msg.text}</p>
                  <span className="text-xs text-black">{formatTimestamp(msg.timestamp)}</span>
                </div>

              <div>
                  
              </div>
              </div>
              

        ))}            
        {/* Typing indicator */}
        {isTyping && (
          <div className="p-2 bg-gray-200 mb-2 rounded text-gray-500">
            {isTyping}
          </div>
        )}
        {/* Notification badge */}
        {unreadMessages > 0 && (
          <div
            className="absolute bottom-2 right-4 bg-blue-500 text-white px-3 py-1 rounded-full cursor-pointer"
            onClick={scrollToBottom}
          >
            {unreadMessages} New Message{unreadMessages > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex items-center p-4 border-t">
        <input
          type="text"
          className="border p-2 flex-1 bg-blue-50 rounded-full focus:outline-none"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
          onKeyUp={handleStopTyping}
        />
        <button
          className="ml-2 p-2 bg-blue-500 text-white rounded-full"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
