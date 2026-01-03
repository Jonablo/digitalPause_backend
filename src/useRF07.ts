import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

export function useRF07() {
  const appState = useRef(AppState.currentState);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextState => {

      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        setSessionCount(prev => prev + 1);
        console.log("RF-07 EVENT → SESSION_START");
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  return {
    sessionCount,
  };
}
