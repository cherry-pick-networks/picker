import { CounterView } from "./CounterView.tsx";
import { useCounter } from "./useCounter.ts";

const Counter = () => <CounterView {...useCounter()} />;
export default Counter;
