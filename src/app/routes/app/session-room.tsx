import { ContentLayout, DashboardLayout } from "@/components/layouts"
import { direction } from "@/features/chat-session/api/list-message"
import ListMessages from "@/features/chat-session/components/list-messages"
import SendMessage from "@/features/chat-session/components/send-message"
import { useUser } from "@/lib/auth"
import { useState } from "react"
import { useParams, useSearchParams } from "react-router"
import { validate } from 'uuid'


const ChatSession = () => {
    const user = useUser();
    const params = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const sessionId = params.sessionId;
    const [currentCursor, setCurrentCursor] = useState<string | null>(null)
    const [currentDirection, setCurrentDirection] = useState<direction>("backward")

    if (!sessionId || !user || !user.data || !validate(sessionId)) {
        return null;
    }

    const onMessageSent : () => void = () => {
        setCurrentCursor(null);
        setCurrentDirection("backward");
    }
    
    const limit = parseInt((searchParams.get("limit")) ?? "10")

    return (
        <ContentLayout title={`Room ${sessionId}`}>
            <ListMessages sessionId={sessionId} limit={limit} currentCursor={currentCursor} currentDirection={currentDirection} setCurrentCursor={setCurrentCursor} setCurrentDirection={setCurrentDirection} />
            <SendMessage sessionId={sessionId} cursor={currentCursor} limit={limit} onMessageSent={onMessageSent}/>
        </ContentLayout>   
    )
}

export default ChatSession;