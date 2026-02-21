import { useState } from "preact/hooks";

export interface CounterViewProps {
  count: number;
  increment: () => void;
}

export function useCounter(): CounterViewProps {
  const [count, setCount] = useState(0);
  return { count, increment: () => setCount((c) => c + 1) };
}
