# Demonstration of Chat Room for Proctoring

Requirement:
The back-end app

Features:
- Users can join a room with a specified `session_id`.
- Users can send a message (rate limited at the back-end to prevent spamming).
- Users can read messages coming from other client.

Mechanism:
- Sending the message will immediately update the data in the cache (so the page doesn't refresh and users don't need to make another fetch request).
- Users receive messages from other users by using websocket, after which the messages are immediately put into the cache so they don't need to refresh just to see the latest messages.
- When sending or receiving messages and it reaches the page limit (set default to 10), the oldest message(s) on the most recent page will be pushed back to the next previous page.
- When users are on pages behind from the most recent message and sends a message, they'll be redirected to the most recent page and if the messages surpass the page limit, refer to #3.

How to use:
- Navigate to /app/chat/session/`session_id`. Reminder `session_id` must be a UUID because we store the `session_id` in the database as UUID.
- This loads up messages (if exists) and sets up websocket connection (ws://.../sessions/`session_id`/chat/message).
- Type the message and send.
- If you want to send the message from other user(s), use another browser or just use Postman with users already logged in and connected to said websocket.

Special thanks to [alan2207](github.com/alan2207) for the boilerplate and introduction to Tanstack Query
