import { createContext, useContext, useState } from 'react'


const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [roomId, setRoomId] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [connected, setConnected] = useState(false)

    const value = {
        roomId,
        setRoomId,
        currentUser,
        setCurrentUser,
        connected,
        setConnected
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}

const useChatContext = () => {
    return useContext(ChatContext);
}

export default useChatContext;