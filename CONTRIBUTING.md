# Contributing to @alexcatdad/prisma-dto-generator

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/conversy/@alexcatdad/prisma-dto-generator.git
cd @alexcatdad/prisma-dto-generator
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Build the project**

```bash
pnpm build
```

## Running Tests

```bash
pnpm test
```

To run tests in watch mode:

```bash
pnpm test --watch
```

## Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

### Check for issues

```bash
pnpm lint
```

### Fix issues automatically

```bash
pnpm format
```

## Development Workflow

1. **Create a branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

- Write tests for new features
- Ensure all tests pass
- Run linting and formatting

3. **Commit your changes**

Use conventional commit messages:

```
feat: add support for custom validators
fix: resolve domain mapping parsing issue
docs: update README with new examples
```

4. **Push and create a Pull Request**

```bash
git push origin feature/your-feature-name
```

## Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Add tests for new features
3. Update documentation if needed
4. Ensure all tests pass
5. Request review from maintainers

## Code Style Guidelines

- Use TypeScript strict mode
- Follow existing code patterns
- Write clear, descriptive variable names
- Add comments for complex logic
- Keep functions focused and small

## Adding New Features

1. **Discuss first**: Open an issue to discuss major changes
2. **Write tests**: All new features must have tests
3. **Update docs**: Update README.md and examples if needed
4. **Update CHANGELOG**: Document changes in CHANGELOG.md

## Reporting Issues

When reporting issues, please include:

- Node.js version
- Prisma version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Relevant code snippets

## Questions?

Feel free to open an issue for questions or discussions about the project.

