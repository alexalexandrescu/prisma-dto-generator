# Prisma NestJS DTO Generator

A Prisma generator that automatically generates NestJS DTOs (Data Transfer Objects) with Swagger/OpenAPI decorators and class-validator decorators from your Prisma schema.

## Features

- ✅ Generates Create, Update, and Read DTOs for all Prisma models
- ✅ Automatically adds Swagger/OpenAPI decorators (`@ApiProperty`, `@ApiPropertyOptional`)
- ✅ Includes class-validator decorators for request validation
- ✅ Supports domain-based folder structure organization
- ✅ Handles Prisma relations (omit, IDs, or nested)
- ✅ Enum generation with TypeScript enums
- ✅ Configurable date strategies and JSON types
- ✅ Customizable file naming conventions (kebab, camel, pascal)
- ✅ Barrel file exports for clean imports

## Installation

```bash
npm install --save-dev prisma-nestjs-dto-generator
# or
yarn add -D prisma-nestjs-dto-generator
# or
pnpm add -D prisma-nestjs-dto-generator
```

## Peer Dependencies

This package requires the following peer dependencies:

- `prisma` (^6.0.0 || ^7.0.0)

Make sure you have these installed in your project.

## Quick Start

1. Add the generator to your `schema.prisma`:

```prisma
generator nestjsDto {
  provider = "prisma-nestjs-dto-generator"
  output   = "../generated/dto"
}
```

2. Run Prisma generate:

```bash
npx prisma generate
```

3. Import and use the generated DTOs in your NestJS controllers:

```typescript
import { CreateUserDto, UpdateUserDto, UserDto } from '../generated/dto';

@Controller('users')
export class UsersController {
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // Use createUserDto
  }

  @Get(':id')
  findOne(@Param('id') id: string): UserDto {
    // Return UserDto
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    // Use updateUserDto
  }
}
```

## Configuration Options

All configuration options are set in your `schema.prisma` file:

```prisma
generator nestjsDto {
  provider = "prisma-nestjs-dto-generator"
  output   = "../generated/dto"
  
  // Optional configuration
  emitBarrel       = "true"
  relations        = "ids"           // "omit" | "ids" | "nested"
  dateStrategy     = "iso-string"    // "iso-string" | "date"
  jsonType         = "Record<string, unknown>"
  fileNaming        = "kebab"        // "kebab" | "camel" | "pascal"
  heuristics        = "true"
  folderStructure   = "flat"         // "flat" | "domain"
  clean             = "false"
}
```

### Configuration Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `emitBarrel` | `boolean` | `true` | Generate barrel files (`index.ts`) for easy imports |
| `relations` | `'omit' \| 'ids' \| 'nested'` | `'ids'` | How to handle Prisma relations in DTOs: omit relations, include only IDs, or include nested objects |
| `dateStrategy` | `'iso-string' \| 'date'` | `'iso-string'` | How to represent DateTime fields: ISO string or Date object |
| `jsonType` | `string` | `'Record<string, unknown>'` | TypeScript type for Json fields |
| `fileNaming` | `'kebab' \| 'camel' \| 'pascal'` | `'kebab'` | Naming convention for generated files |
| `heuristics` | `boolean` | `true` | Use heuristics to determine field types and validators |
| `folderStructure` | `'flat' \| 'domain'` | `'flat'` | File organization: flat structure or domain-based folders |
| `clean` | `boolean` | `false` | Clean output directory before generation |

### Advanced Configuration

#### Omit Fields

Exclude specific fields from certain DTOs:

```prisma
generator nestjsDto {
  provider = "prisma-nestjs-dto-generator"
  output   = "../generated/dto"
  
  omitFields = "{\"User\": [\"password\", \"internalId\"]}"
}
```

#### Read DTO Includes

Include relations in Read DTOs:

```prisma
generator nestjsDto {
  provider = "prisma-nestjs-dto-generator"
  output   = "../generated/dto"
  
  readDtoInclude = "{\"User\": [\"profile\", \"posts\"]}"
}
```

#### Domain Mapping

Organize DTOs into domain-based folders:

```prisma
generator nestjsDto {
  provider = "prisma-nestjs-dto-generator"
  output   = "../generated/dto"
  
  folderStructure = "domain"
  domainMapping = "{\"User\": \"user-management/user\", \"Product\": \"catalog/product\", \"Order\": \"commerce/order\"}"
}
```

The `domainMapping` format is:
- Key: Model name (e.g., `"User"`)
- Value: `"domain/subfolder"` (e.g., `"user-management/user"`)

When using domain structure:
- Models with mappings are organized into `domain/subfolder/` directories
- Models without mappings use flat structure (no domain folder)
- Each domain generates its own barrel file

Example output structure:
```
generated/dto/
├── user-management/
│   ├── user/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   ├── read-user.dto.ts
│   │   └── index.ts
│   └── index.ts
├── catalog/
│   └── product/
│       └── ...
├── enums.ts
└── index.ts
```

## Generated DTOs

For each Prisma model, three DTOs are generated:

### Create DTO (`Create{Model}Dto`)

Used for creating new entities. Includes:
- All required fields
- Optional fields (marked with `?` and `@ApiPropertyOptional`)
- No relations (unless configured)
- No auto-generated fields (id, createdAt, updatedAt)

### Update DTO (`Update{Model}Dto`)

Used for updating entities. Extends `Create{Model}Dto` using NestJS's `PartialType`, making all fields optional.

### Read DTO (`{Model}Dto`)

Used for returning entity data. Includes:
- All fields
- Relations (if configured)
- Read-only fields marked with `readOnly: true` in Swagger

## Examples

### Basic Example

**schema.prisma:**
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

generator nestjsDto {
  provider = "prisma-nestjs-dto-generator"
  output   = "../generated/dto"
}
```

**Generated `create-user.dto.ts`:**
```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ type: 'string', format: 'email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ type: 'string' })
  @IsOptional()
  @IsString()
  name?: string;
}
```

### With Relations

**schema.prisma:**
```prisma
model User {
  id    String @id @default(uuid())
  email String @unique
  posts Post[]
}

model Post {
  id     String @id @default(uuid())
  title  String
  userId String
  user   User   @relation(fields: [userId], references: [id])
}

generator nestjsDto {
  provider = "prisma-nestjs-dto-generator"
  output   = "../generated/dto"
  relations = "ids"  // Use "nested" for full relations
}
```

With `relations = "ids"`, Read DTOs include relation IDs:
```typescript
export class UserDto {
  @ApiProperty({ type: 'string', format: 'uuid', readOnly: true })
  id: string;

  @ApiProperty({ type: 'string' })
  email: string;

  @ApiProperty({ type: 'string', isArray: true })
  postIds: string[];
}
```

### With Enums

**schema.prisma:**
```prisma
enum UserRole {
  USER
  ADMIN
  MODERATOR
}

model User {
  id   String   @id @default(uuid())
  role UserRole @default(USER)
}

generator nestjsDto {
  provider = "prisma-nestjs-dto-generator"
  output   = "../generated/dto"
}
```

**Generated `enums.ts`:**
```typescript
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}
```

**Generated DTO uses the enum:**
```typescript
import { UserRole } from './enums';

export class CreateUserDto {
  @ApiProperty({ enum: UserRole, enumName: 'UserRole' })
  @IsEnum(UserRole)
  role: UserRole;
}
```

## TypeScript Types

The generated DTOs are fully typed and work seamlessly with:
- **NestJS** controllers and services
- **Swagger/OpenAPI** documentation
- **class-validator** for request validation
- **class-transformer** for data transformation

## Testing

This project maintains **100% test coverage** across all source files. Tests are written using Jest and cover all functionality including edge cases and error handling.

### Running Tests

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode with coverage
pnpm test:coverage:watch
```

### Test Coverage

The project uses Jest with the following coverage thresholds:
- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

Coverage reports are generated in multiple formats:
- Text output (console)
- HTML (in `coverage/index.html`)
- JSON (for CI/CD integration)
- LCOV (for coverage services)

You can view the HTML coverage report by opening `coverage/index.html` in your browser after running `pnpm test:coverage`.

### Coverage Badge

![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)

## Troubleshooting

### Generator Not Found

If you see "generator not found" errors:
1. Ensure the package is installed: `npm install --save-dev prisma-nestjs-dto-generator`
2. Run `npx prisma generate` to regenerate

### Invalid Configuration

If configuration parsing fails:
- Check JSON syntax for `omitFields`, `readDtoInclude`, and `domainMapping`
- Ensure boolean options use `"true"` or `"false"` as strings
- Verify option names match the configuration reference

### Domain Mapping Issues

- Ensure `folderStructure = "domain"` when using `domainMapping`
- Domain paths should be in format `"domain/subfolder"`
- Models without mappings will use flat structure

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

