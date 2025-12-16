import { useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { ChatMessage, EventType, MessageEnvelope } from '@/types/api';

export const handleLastMessage = () => {
    
}

export const useChatWebSocket = ({token, sessionId} : {token : string, sessionId: string}) => {
    const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket<MessageEnvelope<ChatMessage>>(`ws://localhost:8080/ws/chat?session_id=${sessionId}`, {
        shouldReconnect: (closeEvent) => true,
        reconnectInterval: 3000,
        protocols: ['bearer', token],
    });
    
    return {
        sendJsonMessage,
        lastJsonMessage,
        readyState,
    };
}