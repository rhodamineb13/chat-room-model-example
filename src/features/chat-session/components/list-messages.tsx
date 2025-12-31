import { Spinner } from "@/components/ui/spinner";
import { direction, useListMessage } from "../api/list-message";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { sendMessage } from "../api/send-message";


const ListMessages = (
    { 
        sessionId, 
        limit,
        currentCursor,
        setCurrentCursor,
        currentDirection,
        setCurrentDirection,
    } : { sessionId: string, limit: number, currentCursor: string | null, setCurrentCursor: (cursor: string | null) => void, currentDirection: direction, setCurrentDirection : (direction : direction) => void }) : React.ReactNode => {
    const {data, isFetching, isLoading} = useListMessage({ sessionId, cursor: currentCursor, limit, direction: currentDirection})
    const navigate = useNavigate();

    const sortedMessages = useMemo(() => {
        if (!data?.data) return [];
        
        // Flatten all pages
        const allMessages = data.data;
        
        // Deduplicate by ID
        const uniqueMessages = Array.from(
          new Map(allMessages.map(msg => [msg.id, msg])).values()
        );
        
        // Sort by sequence number
        return uniqueMessages.sort((a, b) => a.seq - b.seq);
    }, [data?.data]);

    sortedMessages.map((chat) => {
        const fullOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'CET',
            hour12: false,
        };
        const new_created_at = Intl.DateTimeFormat("en", fullOptions).format(new Date(chat.created_at))
        chat.created_at = new_created_at
    })


    if (isLoading) { 
        return (
            <div className="flex h-48 w-full items-center justify-center">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div className="relative w-4/5 min-h-screen border border-red-600 flex flex-col overflow-y-auto">
            {sortedMessages?.map((chat) => (
                <div key={chat.id} className="chat-message">
                    <div className="flex flex-row justify-between w-full chat-message-user-and-created-at">
                        <div className="chat-message-user">
                            <b>{chat.username}</b>
                        </div>
                        <div className="chat-message-created-at">
                            {chat.created_at}
                        </div>
                    </div>
                    <div className="chat-message-content">
                        {chat.content}
                    </div>
                </div>
            ))}
            <div className="flex absolute bottom-0 left-1/2 gap-x-20">
                <button className="bg-blue-500 hover:bg-blue-700 text-white rounded" onClick={() => { setCurrentCursor(data?.previous_cursor!); setCurrentDirection("backward")}} disabled={!!!data?.previous_cursor}>
                    Prev Page
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white rounded" onClick={() => { setCurrentCursor(data?.next_cursor!); setCurrentDirection("forward") }}  disabled={!!!data?.next_cursor}>
                    Next Page
                </button>
            </div>
        </div>
    )
};

export default ListMessages;