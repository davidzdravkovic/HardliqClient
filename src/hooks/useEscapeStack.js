import { useCallback, useRef } from 'react';

export default function useEscapeStack() {
  const handlersRef = useRef([]);

  const registerEscape = useCallback((handler) => {
    handlersRef.current.push(handler);
    return () => {
      handlersRef.current = handlersRef.current.filter((item) => item !== handler);
    };
  }, []);

  const runEscape = useCallback(() => {
    const handlers = [...handlersRef.current].reverse();
    for (const handler of handlers) {
      if (handler()) return true;
    }
    return false;
  }, []);

  return { registerEscape, runEscape };
}
