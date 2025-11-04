# prisma-nest-dto-generator

[![npm version](https://img.shields.io/npm/v/prisma-nest-dto-generator.svg)](https://www.npmjs.com/package/prisma-nest-dto-generator)
[![npm downloads](https://img.shields.io/npm/dm/prisma-nest-dto-generator.svg)](https://www.npmjs.com/package/prisma-nest-dto-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/conversy/prisma-nest-dto-generator)

A Prisma generator that automatically creates NestJS DTOs (Data Transfer Objects) with Swagger/OpenAPI decorators from your Prisma schema.

## Features

- 🎯 **Automatic DTO Generation**: Generates Create, Update, and Read DTOs for all Prisma models
- 📝 **Swagger Integration**: Automatically adds Swagger decorators for OpenAPI documentation
- ✅ **Validation**: Includes class-validator decorators for type-safe validation
- 🔗 **Relation Handling**: Configurable handling of Prisma relations (omit, ids, or nested)
- 📁 **Domain Structure**: Optional domain-based folder organization
- 🔤 **Enum Support**: Generates TypeScript enums from Prisma enums
- 🎨 **Customizable**: Extensive configuration options for different use cases

## Inspiration

This package is heavily inspired by:
- [@brakebein/prisma-generator-nestjs-dto](https://www.npmjs.com/package/@brakebein/prisma-generator-nestjs-dto)
- [prisma-generator-nestjs-dto](https://www.npmjs.com/package/prisma-generator-nestjs-dto)

However, these packages did not work in some projects due to changes in the latest Prisma and NestJS versions. This package was created as a simplified, modern alternative that works with current versions of Prisma (v6+) and NestJS (v10+).

## Installation

```bash
# npm
npm install --save-dev prisma-nest-dto-generator

# yarn
yarn add -D prisma-nest-dto-generator

# pnpm
pnpm add -D prisma-nest-dto-generator

# bun
bun add -d prisma-nest-dto-generator
```

## Quick Start

1. Add the generator to your `schema.prisma`:

```prisma
generator nestdto {
  provider = "prisma-nest-dto-generator"
  output   = "./dto"
}
```

2. Run Prisma generate:

```bash
# npm
npx prisma generate

# yarn
yarn prisma generate

# pnpm
pnpm prisma generate

# bun
bunx prisma generate
```

3. Use the generated DTOs in your NestJS controllers:

```typescript
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Controller('users')
export class UserController {
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // ...
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // ...
  }
}
```

## Configuration

### Basic Configuration

```prisma
generator nestdto {
  provider        = "prisma-nest-dto-generator"
  output          = "./dto"
  emitBarrel      = "true"           // Generate index.ts barrel file
  relations       = "ids"             // How to handle relations: "omit" | "ids" | "nested"
  folderStructure = "flat"            // "flat" | "domain"
  heuristics      = "true"            // Apply smart field type detection
  clean           = "true"            // Clean output directory before generation
}
```

### Advanced Configuration

```prisma
generator nestdto {
  provider        = "prisma-nest-dto-generator"
  output          = "./dto"
  folderStructure = "domain"
  domainMapping   = "./dto-domain-mapping.json"
  dateStrategy    = "iso-string"      // "iso-string" | "date"
  jsonType        = "Record<string, unknown>"
  fileNaming      = "kebab"           // "kebab" | "camel" | "pascal"
  omitFields      = "{\"User\": [\"password\", \"secretKey\"]}"
  readDtoInclude  = "{\"User\": [\"profile\", \"posts\"]}"
}
```

## Configuration Options

### `emitBarrel` (boolean, default: `true`)

Generate an `index.ts` barrel file that exports all DTOs.

### `relations` (`"omit" | "ids" | "nested"`, default: `"ids"`)

How to handle Prisma relations in DTOs:

- **`omit`**: Exclude all relation fields
- **`ids`**: Include only the foreign key IDs (e.g., `userId: string`)
- **`nested`**: Include nested relation objects

### `folderStructure` (`"flat" | "domain"`, default: `"flat"`)

- **`flat`**: All DTOs in a single directory
- **`domain`**: Organize DTOs by domain (requires `domainMapping`)

### `domainMapping` (JSON string or file path, optional)

Map Prisma models to domain folders. You can provide this in two ways:

**Option 1: JSON file (Recommended for better DX)**

Create a `dto-domain-mapping.json` file:

```json
{
  "User": "users/user",
  "Post": "content/post",
  "Comment": "content/comment"
}
```

Then reference it in your schema:

```prisma
generator nestdto {
  provider        = "prisma-nest-dto-generator"
  output          = "./dto"
  folderStructure = "domain"
  domainMapping   = "./dto-domain-mapping.json"
}
```

**Option 2: Inline JSON string**

```prisma
domainMapping = "{\"User\": \"users/user\", \"Post\": \"content/post\", \"Comment\": \"content/comment\"}"
```

**Note**: Domain mappings are optional and must be explicitly provided. There are no built-in defaults, making the package generic for any project.

### `dateStrategy` (`"iso-string" | "date"`, default: `"iso-string"`)

- **`iso-string`**: Use `string` type with ISO date format
- **`date`**: Use TypeScript `Date` type

### `jsonType` (string, default: `"Record<string, unknown>"`)

TypeScript type for Prisma `Json` fields.

### `fileNaming` (`"kebab" | "camel" | "pascal"`, default: `"kebab"`)

Naming convention for generated DTO files:
- `kebab`: `create-user.dto.ts`
- `camel`: `createUser.dto.ts`
- `pascal`: `CreateUser.dto.ts`

### `heuristics` (boolean, default: `true`)

Apply smart field type detection:
- Fields containing "email" → `@IsEmail()`
- Fields containing "url" → `@IsUrl()`
- Fields ending with "Id" → `@IsUUID()`

### `omitFields` (JSON string, optional)

Exclude specific fields from Create/Update DTOs. Format: `{"ModelName": ["field1", "field2"]}`

### `readDtoInclude` (JSON string, optional)

Include specific relation fields in Read DTOs. Format: `{"ModelName": ["relation1", "relation2"]}`

### `clean` (boolean, default: `false`)

Remove all files in the output directory before generation.

## Generated DTO Structure

### CreateDTO

Contains all fields required for creating a new entity (excluding `id`, `createdAt`, `updatedAt`).

### UpdateDTO

Extends `PartialType(CreateDTO)` from `@nestjs/swagger`, making all fields optional.

### ReadDTO

Contains all fields including `id`, `createdAt`, `updatedAt`, and optionally nested relations.

## Domain-Based Folder Structure

When using `folderStructure = "domain"` with `domainMapping`, DTOs are organized like:

```
dto/
  users/
    user/
      create-user.dto.ts
      update-user.dto.ts
      read-user.dto.ts
  content/
    post/
      create-post.dto.ts
      update-post.dto.ts
      read-post.dto.ts
```

## Examples

See the `examples/` directory for:

- **Basic**: Simple setup with minimal configuration
- **Advanced**: Complex schema with relations, enums, and custom mappings
- **NestJS Integration**: Full controller and service examples

## Requirements

- Node.js >= 16
- Prisma >= 6.0.0
- NestJS >= 10.0.0
- TypeScript >= 5.0.0

## Dependencies

The generated DTOs require:

- `@nestjs/swagger`
- `class-validator`
- `class-transformer`

Install them:

```bash
# npm
npm install @nestjs/swagger class-validator class-transformer

# yarn
yarn add @nestjs/swagger class-validator class-transformer

# pnpm
pnpm add @nestjs/swagger class-validator class-transformer

# bun
bun add @nestjs/swagger class-validator class-transformer
```

## Troubleshooting

### DTOs not generating

- Ensure the generator is added to `schema.prisma`
- Run `npx prisma generate` (or `yarn prisma generate`, `pnpm prisma generate`, `bunx prisma generate`)
- Check the output path is correct

### Domain mappings not working

- Verify `folderStructure = "domain"` is set
- Ensure `domainMapping` is valid JSON string
- Check model names match your Prisma schema exactly (case-sensitive)

### Missing decorators

- Ensure `@nestjs/swagger`, `class-validator`, and `class-transformer` are installed
- Check that your NestJS version supports the decorators used

### Type errors

- Ensure all dependencies are installed
- Run `npx prisma generate` (or `yarn prisma generate`, `pnpm prisma generate`, `bunx prisma generate`) after schema changes
- Check TypeScript version compatibility

## License

MIT

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

