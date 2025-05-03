# 10xDev

A modern web application built with Astro and React, designed to help developers achieve maximum productivity.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-22.14.0-brightgreen.svg)](https://nodejs.org/)
[![Astro Version](https://img.shields.io/badge/astro-5.5.5-orange.svg)](https://astro.build/)

## Table of Contents
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Tech Stack

- **Framework**: [Astro](https://astro.build/) v5.5.5
- **UI Library**: [React](https://reactjs.org/) v19.0.0
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4.0.17
- **Components**: [Shadcn/ui](https://ui.shadcn.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) v5
- **Backend**: [Supabase](https://supabase.io/) for authentication and database
- **Testing**:
  - [Vitest](https://vitest.dev/) for unit and integration tests
  - [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for component testing
  - [Playwright](https://playwright.dev/) for end-to-end tests
  - [MSW](https://mswjs.io/) for API mocking
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
- `npm run test` - Run unit and integration tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage reporting
- `npm run test:ui` - Run tests with the UI interface
- `npm run e2e` - Run Playwright end-to-end tests
- `npm run e2e:ui` - Run Playwright tests with UI mode
- `npm run e2e:codegen` - Generate Playwright tests from browser interactions
- `npm run e2e:report` - Display the Playwright HTML test report
- `npm run lint` - Run ESLint to check code
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code using Prettier

## Project Structure

```
./
├── src/
│   ├── layouts/      # Astro layouts
│   ├── pages/        # Astro pages and API endpoints
│   ├── middleware/   # Astro middleware
│   ├── db/           # Database clients and types
│   ├── components/   # UI components (Astro and React)
│   │   └── ui/       # Shadcn/ui components
│   ├── lib/          # Services and helpers
│   ├── assets/       # Internal assets
│   └── types.ts      # Shared types
├── public/           # Static assets
├── tests/            # Unit and integration tests
│   └── setup.ts      # Test setup for Vitest
└── e2e/              # End-to-end tests with Playwright
    ├── pages/        # Page object models
    └── *.spec.ts     # Test specifications
```

## Testing

The project uses a comprehensive testing approach:

### Unit and Integration Testing

Unit and integration tests are written using Vitest and React Testing Library. They focus on testing individual components, utilities, and services.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### End-to-End Testing

End-to-end tests use Playwright and follow the Page Object Model pattern for better maintainability:

```bash
# Run all e2e tests
npm run e2e

# Run e2e tests with UI mode (for debugging)
npm run e2e:ui

# Generate tests from browser interactions
npm run e2e:codegen

# View test reports
npm run e2e:report
```

#### Page Object Model

The e2e tests are organized using the Page Object pattern:

- `e2e/pages/` - Contains page objects that encapsulate page structure and actions
- `e2e/*.spec.ts` - Test specifications that use the page objects

This separation makes tests more maintainable and easier to update when the UI changes.

## Project Scope

The project aims to provide a modern, type-safe web application with:

- Fast page loads using Astro's partial hydration
- Interactive UI components built with React
- Consistent styling with Tailwind CSS
- Robust type safety with TypeScript
- Comprehensive testing at all levels (unit, integration, e2e)
- Clean and maintainable code structure
- Modern development tooling and best practices

## Project Status

🚧 Under Development

The project is currently in active development. Features and documentation are being added regularly.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.