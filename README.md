# 10xDev

A modern web application built with Astro and React, designed to help developers achieve maximum productivity.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-22.14.0-brightgreen.svg)](https://nodejs.org/)
[![Astro Version](https://img.shields.io/badge/astro-5.5.5-orange.svg)](https://astro.build/)

## Table of Contents
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Tech Stack

- **Framework**: [Astro](https://astro.build/) v5.5.5
- **UI Library**: [React](https://reactjs.org/) v19.0.0
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4.0.17
- **Components**: [Shadcn/ui](https://ui.shadcn.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) v5
- **Development Tools**:
  - ESLint for code linting
  - Prettier for code formatting
  - Husky for Git hooks
  - Lint-staged for pre-commit checks

## Getting Started

### Prerequisites

- Node.js v22.14.0 (as specified in .nvmrc)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tmster/10xdev.git
   cd 10xdev
   ```

2. Install Node.js using nvm:
   ```bash
   nvm install
   nvm use
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the production application
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code using Prettier

## Project Structure

```
./src/
├── layouts/     # Astro layouts
├── pages/       # Astro pages and API endpoints
├── middleware/  # Astro middleware
├── db/         # Database clients and types
├── components/ # UI components (Astro and React)
├── lib/        # Services and helpers
├── assets/     # Internal assets
└── types.ts    # Shared types
```

## Project Scope

The project aims to provide a modern, type-safe web application with:

- Fast page loads using Astro's partial hydration
- Interactive UI components built with React
- Consistent styling with Tailwind CSS
- Robust type safety with TypeScript
- Clean and maintainable code structure
- Modern development tooling and best practices

## Project Status

🚧 Under Development

The project is currently in active development. Features and documentation are being added regularly.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.