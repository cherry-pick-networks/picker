# {{repo_name}}

Deno app: Fresh 2 (HTTP), Zod, ts-morph (AST), Deno KV. Entry: `main.ts`; client: `client.ts`. File-based routes in `system/router/` (Fresh 2 structure; dev uses programmatic routes in `main.ts`).

## Run

- **Dev**: `deno task dev` (runs `main.ts` with watch)
- **Once**: `deno run -A --unstable-kv main.ts`
- **Build** (optional): `deno task build` — then **Start**: `deno task start`
- **Test**: `deno test`

## Documentation

Domain entry points only; details are in each domain's README.

- **Shared**: [shared/README.md](shared/README.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). For general or contribution questions: [contact@cherry-pick.net](mailto:contact@cherry-pick.net).

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). For CoC concerns: [conduct@cherry-pick.net](mailto:conduct@cherry-pick.net).

## License

[AGPL-3.0](LICENSE). © [cherry-pick](https://cherry-pick.net).
