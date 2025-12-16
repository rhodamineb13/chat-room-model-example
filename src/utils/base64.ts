export function encodetoBase64({ created_at, user_id} : { created_at: string, user_id: string}) : string {
    const stringified = JSON.stringify({ created_at, user_id})
    console.log(stringified)
    const encoded = btoa(stringified)
    return encoded
}