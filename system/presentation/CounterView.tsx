import React from "preact/compat";
import type { CounterViewProps } from "./useCounter.ts";

export const CounterView = ({ count, increment }: CounterViewProps) => (
  <div>
    <p>{count}</p>
    <button type="button" onClick={increment}>+1</button>
  </div>
);
