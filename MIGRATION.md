# Migration Guide: Extracting prisma-nest-dto-generator to Standalone Repository

This document contains all the information needed to extract this package from the monorepo and set it up as a standalone repository.

## Current Status

### ✅ Completed

- [x] Removed hardcoded Conversy-specific domain mappings from `domain-mapper.ts`
- [x] Updated package.json with new name (`prisma-nest-dto-generator`), version (`0.0.1`)
- [x] Added publish configuration (public access, repository URLs)
- [x] Created comprehensive documentation (README.md, CONTRIBUTING.md, CHANGELOG.md, PUBLISHING.md)
- [x] Created LICENSE file (MIT)
- [x] Created examples directory with basic, advanced, and NestJS integration examples
- [x] Created GitHub Actions workflows (CI and publish)
- [x] Created .npmignore, .gitignore, biome.json
- [x] Added support for JSON file-based domain mapping (improved DX)
- [x] Package builds and lints successfully
- [x] Tested with API package using local file path

### 📋 Key Files

**Source Code:**
- `src/index.ts` - Main generator entry point
- `src/dmmf-parser.ts` - Parses Prisma DMMF
- `src/domain-mapper.ts` - Maps models to domain folders (no hardcoded defaults)
- `src/dto-generator.ts` - Generates DTO files
- `src/type-mapper.ts` - Maps Prisma types to TypeScript/Swagger types
- `src/types.ts` - TypeScript type definitions

**Configuration:**
- `package.json` - Package metadata (name: `prisma-nest-dto-generator`, version: `0.0.1`)
- `tsconfig.json` - TypeScript configuration
- `biome.json` - Linting/formatting configuration
- `jest.config.js` - Test configuration

**Documentation:**
- `README.md` - Main documentation with usage examples
- `CONTRIBUTING.md` - Development guidelines
- `CHANGELOG.md` - Version history
- `PUBLISHING.md` - Publishing instructions
- `LICENSE` - MIT License

**Examples:**
- `examples/basic/` - Simple setup example
- `examples/advanced/` - Complex domain structure example
- `examples/nestjs-integration/` - Full NestJS integration example

**CI/CD:**
- `.github/workflows/ci.yml` - Continuous integration
- `.github/workflows/publish.yml` - Automated npm publishing

## Extraction Steps

### 1. Create New Repository

```bash
# Create new repo on GitHub
gh repo create prisma-nest-dto-generator --public --description "Prisma generator for NestJS DTOs with Swagger support"

# Clone and initialize
git clone git@github.com:conversy/prisma-nest-dto-generator.git
cd prisma-nest-dto-generator
```

### 2. Copy Package Files

Copy the entire `packages/prisma-nest-dto-generator` directory to the new repo:

```bash
# From monorepo root
cp -r packages/prisma-nest-dto-generator/* /path/to/new-repo/
```

**Files to copy:**
- `src/` (entire directory)
- `package.json`
- `tsconfig.json`
- `jest.config.js`
- `biome.json`
- `README.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- `PUBLISHING.md`
- `LICENSE`
- `.npmignore`
- `.gitignore`
- `.github/workflows/` (entire directory)
- `examples/` (entire directory)

**Files to exclude:**
- `node_modules/`
- `dist/` (will be regenerated)
- Any monorepo-specific files

### 3. Update Repository URLs

Update `package.json` repository URLs if they differ:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/conversy/prisma-nest-dto-generator.git"
  },
  "homepage": "https://github.com/conversy/prisma-nest-dto-generator#readme",
  "bugs": {
    "url": "https://github.com/prisma-nest-dto-generator/issues"
  }
}
```

### 4. Initialize Repository

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit: Extract prisma-nest-dto-generator from monorepo"

# Set up remote
git remote add origin git@github.com:conversy/prisma-nest-dto-generator.git
git branch -M main
git push -u origin main
```

### 5. Install Dependencies

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint
```

### 6. Verify Everything Works

```bash
# Build
pnpm build

# Lint
pnpm lint

# Test
pnpm test

# Verify dist/ output
ls -la dist/
```

## Post-Extraction Setup

### Update API Package

After publishing, update `apps/api/prisma/schema.prisma`:

```prisma
generator nestdto {
  provider        = "prisma-nest-dto-generator"  // Use published package name
  output          = "./dto"
  emitBarrel      = "true"
  relations       = "ids"
  folderStructure = "domain"
  heuristics      = "true"
  clean           = "true"
  domainMapping   = "./dto-domain-mapping.json"
}
```

And install the package:

```bash
cd apps/api
pnpm add -D prisma-nest-dto-generator
```

## Testing the Package

### Local Testing (Before Publishing)

You can test the package locally before publishing:

1. **Build the package:**
   ```bash
   pnpm build
   ```

2. **Link it locally:**
   ```bash
   npm link
   ```

3. **Use it in another project:**
   ```bash
   cd /path/to/test-project
   npm link prisma-nest-dto-generator
   ```

4. **Test generation:**
   ```bash
   npx prisma generate
   ```

### Test with API Package

The API package currently uses a local file path:

```prisma
provider = "../../packages/prisma-nest-dto-generator/dist/index.js"
```

After publishing, change to:
```prisma
provider = "prisma-nest-dto-generator"
```

## Publishing Checklist

Before publishing:

- [ ] All tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Documentation is up to date
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Version bumped in src/index.ts (onManifest)
- [ ] Repository URLs are correct
- [ ] License file is correct

### Publishing Steps

See `PUBLISHING.md` for detailed instructions.

Quick version:

```bash
# Bump version
npm version patch  # or minor/major

# Build
pnpm build

# Dry run
npm publish --dry-run

# Publish
npm publish

# Push tags
git push --tags
```

## Known Issues / TODOs

### Current State

- ✅ Package builds and lints successfully
- ✅ Generator works with local file path
- ✅ Domain mapping supports JSON file (better DX)
- ✅ Examples are included

### Future Improvements

- [ ] Add more comprehensive test coverage
- [ ] Add TypeScript types for generated DTOs
- [ ] Support for custom validator decorators
- [ ] Support for custom Swagger decorators
- [ ] Add support for multiple output formats
- [ ] Performance optimizations for large schemas

## Architecture Overview

### Generator Flow

1. **Entry Point** (`src/index.ts`):
   - Handles Prisma generator interface
   - Parses configuration (including JSON file support)
   - Coordinates DTO generation

2. **DMMF Parser** (`src/dmmf-parser.ts`):
   - Parses Prisma DMMF (Data Model Meta Format)
   - Extracts models and enums
   - Converts to internal representation

3. **Domain Mapper** (`src/domain-mapper.ts`):
   - Maps models to domain folders
   - No hardcoded defaults (fully generic)
   - Supports custom mappings via config

4. **Type Mapper** (`src/type-mapper.ts`):
   - Maps Prisma types to TypeScript types
   - Maps to Swagger/OpenAPI types
   - Applies heuristics (email, URL, UUID detection)
   - Generates validation decorators

5. **DTO Generator** (`src/dto-generator.ts`):
   - Generates CreateDTO, UpdateDTO, ReadDTO
   - Organizes files by domain structure
   - Generates barrel files
   - Handles relations (omit, ids, nested)

## Configuration Options

See `README.md` for full configuration documentation.

Key options:
- `domainMapping` - JSON file path or inline JSON string
- `folderStructure` - "flat" or "domain"
- `relations` - "omit", "ids", or "nested"
- `heuristics` - Enable smart field type detection
- `omitFields` - Exclude fields from DTOs
- `readDtoInclude` - Include relations in ReadDTOs

## Dependencies

### Runtime Dependencies
- `@prisma/generator-helper` - Prisma generator utilities
- `@prisma/internals` - Prisma internals

### Dev Dependencies
- `@biomejs/biome` - Linting and formatting
- `@types/jest` - Jest type definitions
- `@types/node` - Node.js type definitions
- `jest` - Testing framework
- `ts-jest` - TypeScript Jest preset
- `typescript` - TypeScript compiler

### Peer Dependencies (Required by Generated DTOs)
- `@nestjs/swagger` - Swagger decorators
- `class-validator` - Validation decorators
- `class-transformer` - Transformation utilities

## Troubleshooting

### Build Issues

If build fails:
```bash
# Clean and rebuild
rm -rf dist node_modules
pnpm install
pnpm build
```

### Linting Issues

If linting fails:
```bash
# Auto-fix what can be fixed
pnpm format
```

### Test Issues

If tests fail:
```bash
# Run tests with verbose output
pnpm test --verbose
```

### Generator Not Found

If Prisma can't find the generator:
- Ensure package is built (`pnpm build`)
- Check `package.json` has correct `bin` field
- Verify `dist/index.js` exists and is executable

## Next Steps After Extraction

1. **Set up CI/CD:**
   - GitHub Actions should work automatically
   - Update NPM_TOKEN secret in repository settings

2. **Publish initial version:**
   - Follow `PUBLISHING.md` guide
   - Start with version `0.0.1`

3. **Update API package:**
   - Install published package
   - Update schema.prisma provider
   - Test generation

4. **Community:**
   - Add GitHub topics/tags
   - Create example projects
   - Write blog post/documentation

## Contact / Support

- Repository: https://github.com/conversy/prisma-nest-dto-generator
- Issues: https://github.com/conversy/prisma-nest-dto-generator/issues
- NPM: https://www.npmjs.com/package/prisma-nest-dto-generator

## Notes

- The package is fully standalone - no monorepo dependencies
- All hardcoded Conversy-specific mappings have been removed
- Domain mappings are now explicit and user-provided
- JSON file support makes domain mapping much easier to maintain
- Examples are included for quick onboarding

