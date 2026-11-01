# GameVault

A browser arcade featuring classic arcade, strategy, puzzle, and word games, built as a single-page React application.

## Overview

GameVault brings its game logic and interfaces together in one React application. Games are loaded through React's lazy-loading support, and high scores or saved state use browser local storage where supported.

## Features

- **54+ playable minigames** across arcade, puzzle, card, word, reflex, and strategy categories.
- **Self-contained game components** built with JavaScript and React.
- **Shared arcade interface** for navigation, pause controls, and score history.
- **Browser-based play** without requiring a separate game engine.

## Tech stack

- React 18
- Vite
- Styled-components
- React Router DOM

## Development

Requirements: a current LTS version of Node.js and npm.

```bash
git clone https://github.com/Aaqibhafeezkhan/GameVault.git
cd GameVault
npm ci
npm run dev
```

Create a production build with:

```bash
npm run build
```

Game implementations live under `src/games/`. Follow the existing component patterns and update the relevant game metadata or routing when adding a game.

## Deployment

GameVault can be deployed to GitHub Pages using the GitHub Actions workflow in `.github/workflows/deploy.yml`.

1. Open **Settings → Pages** in the repository.
2. Set the build and deployment source to **GitHub Actions**.
3. Push to `main` to trigger deployment, or run the workflow manually from the Actions tab.

## Contributing

Contributions are welcome. Start with the [contribution guide](CONTRIBUTING.md), browse [open issues](https://github.com/Aaqibhafeezkhan/GameVault/issues), and check for the `good first issue`, `help wanted`, or `up-for-grabs` labels.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md). To report a security concern, see [SECURITY.md](SECURITY.md).

## License

GameVault is licensed under the [MIT License](LICENSE).
