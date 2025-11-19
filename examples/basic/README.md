# Basic Example

This example demonstrates a simple setup with minimal configuration.

## Schema

The `schema.prisma` file contains 2-3 basic models with common field types.

## Configuration

```prisma
generator nestdto {
  provider   = "@alexcatdad/prisma-dto-generator"
  output     = "./generated"
  emitBarrel  = "true"
}
```

## Generated Output

The generator creates:
- `create-user.dto.ts` - CreateDTO for User model
- `update-user.dto.ts` - UpdateDTO for User model
- `read-user.dto.ts` - ReadDTO for User model
- `index.ts` - Barrel file exporting all DTOs

## Usage

```typescript
import { CreateUserDto, UpdateUserDto } from './generated'

@Controller('users')
export class UserController {
  @Post()
  create(@Body() dto: CreateUserDto) {
    // Use dto here
  }
}
```

