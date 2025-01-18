import React, { useEffect, useState } from "react";
import socket from "../socket";
import axios from "axios"


interface Message {
  text: string;
  user: string;
}

interface ChatProps {
  user: { displayName: string | null;
  email: string | null;
  uid: string
  }
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [message, setMessage] = useState(""); // Input message
  const [messages, setMessages] = useState<Message[]>([]); // Message list

  //fetch previous messages
  useEffect(()=>{
    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:5000/messages")
        setMessages(response.data)
      } catch(error){
        console.error("Error Fetching messages: ", error)
      }
    }
    fetchMessages()
  },[])

  //listen for new messages
  useEffect(()=>{
    const handleMessage = (newMessage: { user: string; text: string}) => {
      setMessages((prevMessages)=>[...prevMessages, newMessage])
    }

    socket.on("receiveMessage", handleMessage)

    return() =>{
      socket.off("receiveMessage", handleMessage) //clean up listener
    }
  },[])

  // send a message
  const sendMessage = () => {
    if (message.trim()) {
      const username = user.displayName || "Anonymous"
      const newMessage = { user: username, text: message}

      socket.emit("sendMessage", newMessage)
      setMessages((prevMessages) => [...prevMessages, { user:username, text: message }]);
      setMessage(""); // Clear input
    }
  };

  return (
    <div className="flex flex-col w-full h-[400px] border p-4">
      {/* Message Display */}
      <div className="flex-1 overflow-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="p-2 bg-gray-100 mb-2 rounded">
            <strong>{msg.user}:</strong> {msg.text}
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
