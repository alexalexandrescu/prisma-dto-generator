# Quick Start Guide

## Current Location
Monorepo: `packages/prisma-nest-dto-generator/`

## Quick Extraction Commands

```bash
# 1. Create new repo (adjust org/name as needed)
gh repo create prisma-nest-dto-generator --public

# 2. Clone it
git clone git@github.com:conversy/prisma-nest-dto-generator.git
cd prisma-nest-dto-generator

# 3. Copy files from monorepo (run from monorepo root)
cp -r packages/prisma-nest-dto-generator/* /path/to/prisma-nest-dto-generator/

# 4. Remove monorepo-specific files
rm -rf node_modules dist

# 5. Initialize
pnpm install
pnpm build
pnpm test

# 6. Commit and push
git add .
git commit -m "Initial commit"
git push origin main
```

## Key Points

- ✅ Package is ready to extract
- ✅ All hardcoded mappings removed
- ✅ Supports JSON file for domain mapping (better DX)
- ✅ Documentation complete
- ✅ Examples included
- ✅ CI/CD workflows ready

## After Extraction

1. Publish to npm: `npm publish`
2. Update API package to use published version
3. Remove local file path reference

See `MIGRATION.md` for detailed instructions.

