# picker

Deno app: Hono (HTTP), Zod, ts-morph (AST), PostgreSQL. Entry: `main.ts`; client:
`client.ts`. Routes from `system/routes.ts` and `system/app/*.config.ts`; dev
uses `main.ts`.

## Run

- **Dev**: `deno task dev` (runs `main.ts` with watch)
- **Once**: `deno run -A main.ts`
- **Build** (optional): `deno task build` — then **Start**: `deno task start`
- **Test**: `deno test`

## Documentation

Domain entry points only; details are in each domain's README.

- **Shared**: [shared/README.md](shared/README.md)
- **System**: [system/README.md](system/README.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). For general or contribution questions:
[contact@cherry-pick.net](mailto:contact@cherry-pick.net).

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). For CoC
concerns: [conduct@cherry-pick.net](mailto:conduct@cherry-pick.net).

## License

[AGPL-3.0](LICENSE). © [cherry-pick](https://cherry-pick.net).
