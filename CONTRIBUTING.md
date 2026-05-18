# Contributing to PayChain

First off, thank you for considering contributing to PayChain! It's people like you that make PayChain such a great tool for decentralized payroll.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please be respectful and constructive in all communication.

## How Can I Contribute?

### Reporting Bugs
If you find a bug, please create an issue on GitHub. Include:
- A clear and descriptive title.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Screenshots if applicable.
- Your environment details (OS, Node version, browser, etc.).

### Suggesting Enhancements
Enhancement suggestions are welcome! Create an issue with:
- A clear description of the feature.
- Why this enhancement would be useful.
- Potential implementation details if you have them in mind.

### Pull Requests
We gladly accept pull requests. To contribute code:

1. **Fork the Repository:** Fork the repo and create your branch from `main`.
2. **Setup Development Environment:** Follow the [Quick Start](README.md#quick-start) guide in the README.
3. **Make Your Changes:** 
   - Write clear, commented, and testable code.
   - Follow the existing code style (we use ESLint and Prettier).
   - Ensure your changes do not break existing functionality.
4. **Commit Your Changes:**
   - Use conventional commits (e.g., `feat: add stellar wallet integration`, `fix: resolve jwt verification bug`).
5. **Run Tests:** Ensure all tests pass and the application builds successfully (`npm run build`).
6. **Submit a PR:** Open a pull request against the `main` branch. Provide a detailed description of your changes in the PR template.

## Development Guidelines

### Monorepo Structure
PayChain is a monorepo. Please ensure you are working in the correct directory:
- `apps/frontend`: For UI/UX and React/Next.js changes.
- `apps/backend`: For API, database schema (Prisma), and core business logic.
- `contracts`: For blockchain smart contracts (Rust).

### Branch Naming Convention
- Feature branches: `feature/your-feature-name`
- Bugfix branches: `fix/your-bugfix-name`
- Refactor branches: `refactor/what-you-refactored`
- Documentation: `docs/update-readme`

### Database Changes
If your PR requires a database schema change:
1. Update `apps/backend/prisma/schema.prisma`.
2. Run `npm run db:push` locally to test.
3. Ensure you mention the schema change prominently in your PR description.

## Review Process
All pull requests will be reviewed by the maintainers. We may request changes or provide feedback. Once the review is approved and CI checks pass, your PR will be merged.

Thank you for contributing to PayChain! 🚀
