import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { ChatMessage, PaginatedResponse } from '@/types/api';
import { infiniteQueryOptions, queryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query';

export type direction = 'forward' | 'backward';

export const listMessage = ({ cursor, sessionId, limit, direction }: { cursor: string | null; sessionId: string; limit : number; direction : direction}) : Promise<PaginatedResponse<ChatMessage>> => {    
    return api.get(`/sessions/${sessionId}/chat/messages?${cursor ? `cursor=${cursor}&` : ''}limit=${limit}&direction=${direction}`);
}

// export const listInfiniteMessageQueryOptions = ({ cursor, sessionId, limit, direction }: {cursor? : string; sessionId: string; limit : number; direction : direction}) => {
//     return infiniteQueryOptions({
//         queryKey: ['sessions', sessionId, 'messages', { limit, direction }],
//         queryFn: ({ pageParam }) => listMessage(pageParam),
//         getNextPageParam: (lastPage) => {
//             return lastPage.next_cursor ? {cursor: lastPage.next_cursor, sessionId: sessionId, limit: limit, direction:'forward' as direction} : undefined
//         },
//         getPreviousPageParam: (firstPage) => {
//             return firstPage.previous_cursor? {cursor: firstPage.previous_cursor, sessionId: sessionId, limit: limit, direction:'backward' as direction} : undefined
//         },
//         initialPageParam: {cursor: null as string | null, sessionId: sessionId, limit: limit, direction: direction},
        
//     })   
// }

// type listInfiniteMessageOptions = {
//     queryConfig?: QueryConfig<typeof listInfiniteMessageQueryOptions>;
//     sessionId : string;
//     cursor?: string;
//     limit: number;
//     direction: direction;
// }


// export const useInfiniteListMessage = ({ queryConfig, sessionId, cursor, limit, direction }: listInfiniteMessageOptions) => {
//     return useInfiniteQuery({
//         ...listInfiniteMessageQueryOptions({ sessionId: sessionId, cursor: cursor, limit: limit, direction: direction }), ...queryConfig    });
// }


export const listMessageQueryOptions = ({ cursor, sessionId, limit, direction }: {cursor : string | null; sessionId: string; limit : number; direction : direction}) => {
    return queryOptions({
        queryKey: ['sessions', sessionId, 'messages', { cursor, limit }],
        queryFn: () => { console.log("fetching from cursor", cursor, "and limit", limit); return listMessage({cursor, sessionId, limit, direction});},
    })   
}

type listMessageOptions = {
    queryConfig?: QueryConfig<typeof listMessageQueryOptions>;
    sessionId : string;
    cursor: string | null;
    limit: number;
    direction: direction;
}

export const useListMessage = ({ queryConfig, sessionId, cursor, limit, direction }: listMessageOptions) => {
    return useQuery({
        ...listMessageQueryOptions({ sessionId: sessionId, cursor: cursor, limit: limit, direction: direction }), 
        ...queryConfig    });
}