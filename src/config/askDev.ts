/** Ask chat: on in Vite dev, or when VITE_ENABLE_ASK=true (e.g. local Docker). */
export const askChatEnabled =
  import.meta.env.VITE_ENABLE_ASK === 'true' ||
  (import.meta.env.DEV && import.meta.env.VITE_ENABLE_ASK !== 'false');
