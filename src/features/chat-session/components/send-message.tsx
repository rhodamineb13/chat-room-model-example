import { useNotifications } from "@/components/ui/notifications"
import { sendMessageDTO, sendMessageSchema, useSendMessage } from "../api/send-message"
import { Form, FormDrawer, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React, { useEffect } from "react";
import { useChatWebSocket } from "../api/websocket";
import { useQueryClient } from "@tanstack/react-query";
import { ChatMessage, EventType, MessageEnvelope, PaginatedResponse } from "@/types/api";
import { useUser } from "@/lib/auth";
import { useNavigate } from "react-router";
import { encodetoBase64 } from "@/utils/base64";


const SendMessage = ({ sessionId, cursor, limit, onMessageSent}: { sessionId: string, cursor: string | null, limit: number, onMessageSent: () => void }): React.ReactNode => {
    const user = useUser();
    const navigate = useNavigate();

    if (!user || !user.data) {
        navigate("/auth/login")
        return null
    }
    const { addNotification } = useNotifications();
    const { sendJsonMessage, lastJsonMessage, readyState } = useChatWebSocket({token: user.data.token, sessionId: sessionId})
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!lastJsonMessage || lastJsonMessage.type !== EventType.CMSend) return;

        if (lastJsonMessage.payload.user_id === user.data!.user_id) return; 
        const ackData : MessageEnvelope<ChatMessage> = {
            type: EventType.CMAck,
            idempotency_key: lastJsonMessage.idempotency_key,
            message_id: lastJsonMessage.message_id,
            session_id: lastJsonMessage.session_id,
            correlation_id: lastJsonMessage.correlation_id,
            payload: lastJsonMessage.payload,
            sent_at: new Date(),
            created_at: lastJsonMessage.created_at
        };

        queryClient.setQueryData(['sessions', sessionId, 'messages', { cursor: null, limit: limit }], (old: PaginatedResponse<ChatMessage> | undefined) => {
            if (!old) return old;
            
            let newMessages = [...old.data, lastJsonMessage.payload]
            if (newMessages.length > limit) {
                newMessages =  newMessages.slice(1)
            }

            const new_first_data = {
                created_at: old.data[1].created_at,
                user_id: old.data[1].user_id
            };
            const encoded = encodetoBase64(new_first_data);
            
            return {
                ...old,
                data: newMessages,
                previous_cursor: encoded,
            };
        })
        
        sendJsonMessage(ackData);

    }, [lastJsonMessage]);
    
    const sendMessageMutation = useSendMessage({
        sessionId: sessionId,
        onMessageSent: onMessageSent,
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget)
        const message = formData.get("message") as string
        const data: sendMessageDTO = {
            content: message,
        }
        sendMessageMutation.mutateAsync({
            data: data,
            session_id: sessionId,
        })
        e.preventDefault()
    }

    return (
        <div className="w-4/5">
            <form className="flex flex-row justify-left items-center" onSubmit={handleSubmit}>
                <textarea name="message" className="border border-green-600 w-2/5 h-200" />
                <button className="h-12 text-lg bg-blue-600">
                    <span className="text-white">AAA</span>
                </button>
            </form>
        </div>
    )
}

export default SendMessage;