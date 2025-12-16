import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { useUser } from '@/lib/auth';
import { MutationConfig } from '@/lib/react-query';
import { ChatMessage, CommonResponse, PaginatedResponse } from '@/types/api';
import { encodetoBase64 } from '@/utils/base64';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

const fileSchema = z.
                    instanceof(File).
                    refine((file : File) => file.size <= MAX_BYTES, { message: 'File is too large (max. 10 MB)'}).
                    refine((file : File) => ALLOWED_TYPES.includes(file.type), { message: 'Unsupported file type.'});

export const sendMessageSchema = z.object({
    content: z.string().min(1, 'Required'),
    attachment: z.array(fileSchema).optional(),
});

export type sendMessageDTO = z.infer<typeof sendMessageSchema>;

export const sendMessage = async ({ data, session_id }: { data : sendMessageDTO, session_id : string}) : Promise<CommonResponse<ChatMessage>> => {
    const headers = {
        'X-Idempotency-Key': crypto.randomUUID(),
    }
    
    const res = await api.post(`/sessions/${session_id}/chat/messages`, data, { headers }) as CommonResponse<ChatMessage>;
    console.log(res)

    return res 
}

type UseSendMessageOptions = {
    mutationConfig?: MutationConfig<typeof sendMessage>, 
    sessionId: string,
    onMessageSent: () => void
};

export const useSendMessage = ({
    mutationConfig,
    sessionId,
    onMessageSent
}: UseSendMessageOptions) => {
    const queryClient = useQueryClient();

    const { onSuccess, ...remainingConfigs } = mutationConfig || {}

    return useMutation({
        onSuccess: (responseData, vars) => {
            queryClient.setQueryData(['sessions', sessionId, 'messages', {cursor: null, limit: 10}], (old: PaginatedResponse<ChatMessage | undefined>) => {
                if (!old || !old.data) return old;

                const newMessage = responseData.data;

                let newMessages = [...old.data, newMessage];
                if (newMessages.length > 10) {
                    newMessages = newMessages.slice(1);
                }


                const new_previous_cursor = {
                    created_at: old.data[1]!.created_at,
                    user_id: old.data[1]!.user_id,
                }

                const encoded = encodetoBase64(new_previous_cursor)
                
                return {
                    ...old,
                    previous_cursor: encoded,
                    data: newMessages
                }
            });
            onMessageSent();
        },
        ...remainingConfigs,
        mutationFn: sendMessage,
    });
};