# Publishing Guide

This guide explains how to publish new versions of `@alexcatdad/prisma-dto-generator` to npm.

## Pre-Publish Checklist

Before publishing, ensure:

- ✅ All tests passing (`pnpm test`)
- ✅ Linting passes (`pnpm lint`)
- ✅ Build succeeds (`pnpm build`)
- ✅ Documentation updated (README.md, CHANGELOG.md)
- ✅ CHANGELOG.md updated with version and changes
- ✅ No breaking changes (or version bump reflects breaking changes)

## Version Bump Strategy

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.0.X): Bug fixes, minor improvements
- **Minor** (0.X.0): New features, backward compatible
- **Major** (X.0.0): Breaking changes

## Publishing Steps

### 1. Update Version

Update version in `package.json` and `CHANGELOG.md`:

```bash
npm version [patch|minor|major]
```

This will:
- Update `package.json` version
- Create a git commit
- Create a git tag

### 2. Build the Package

```bash
pnpm build
```

The `prepublishOnly` script will run automatically, but verify the build manually.

### 3. Dry Run

Test the publish process without actually publishing:

```bash
npm publish --dry-run
```

Check the output to ensure:
- Correct files are included
- No unnecessary files are included
- Package metadata is correct

### 4. Publish to npm

```bash
npm publish
```

This will:
- Run `prepublishOnly` (build)
- Publish to npm registry
- Make the package available publicly

### 5. Verify Publication

1. Check npm: https://www.npmjs.com/package/@alexcatdad/prisma-dto-generator
2. Verify version appears correctly
3. Test installation in a new project:

```bash
npm install --save-dev @alexcatdad/prisma-dto-generator
```

### 6. Push to GitHub

Push commits and tags:

```bash
git push origin main
git push --tags
```

### 7. Create GitHub Release (Optional)

1. Go to GitHub Releases
2. Create a new release from the tag
3. Copy changelog entry to release notes
4. Publish release

## Rollback Procedure

If something goes wrong:

### Before Publishing

- If you haven't published yet, just fix the issue and try again
- Update version if needed

### After Publishing

1. **Unpublish** (within 72 hours):

```bash
npm unpublish @alexcatdad/prisma-dto-generator@<version>
```

2. **Publish fixed version**:

```bash
npm version patch  # or minor/major
npm publish
```

**Note**: Only unpublish if absolutely necessary. Consider publishing a patch version instead.

## Automated Publishing

The project includes GitHub Actions workflow (`.github/workflows/publish.yml`) that can automate publishing:

- Triggered by git tags matching `v*`
- Automatically runs tests and builds
- Publishes to npm if all checks pass

To use automated publishing:

```bash
git tag v0.0.1
git push origin v0.0.1
```

## Best Practices

1. **Never skip tests**: Always run tests before publishing
2. **Version consistency**: Keep version in sync across files
3. **Changelog**: Always update CHANGELOG.md before publishing
4. **Release notes**: Write clear release notes for users
5. **Test installation**: Verify the package installs correctly
6. **Documentation**: Ensure docs reflect new features/changes

## Troubleshooting

### npm publish fails

- Check you're logged in: `npm whoami`
- Verify package name isn't taken
- Check npm registry settings

### Wrong files included

- Verify `.npmignore` is correct
- Check `files` field in `package.json`
- Run `npm pack` to preview package contents

### Version conflicts

- Ensure version hasn't been published before
- Check npm registry for existing versions
- Use a different version number if needed

