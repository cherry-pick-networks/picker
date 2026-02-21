/// <reference path="./fresh-core.d.ts" />
import type { PageProps } from "fresh";
import React from "preact/compat";

export function AppLayout({ Component }: PageProps) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>picker</title>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
