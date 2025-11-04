# NestJS Integration Example

This example shows how to use generated DTOs in a real NestJS application.

## Overview

- `schema.prisma` - Prisma schema with User model
- `user.controller.ts` - NestJS controller using generated DTOs
- `user.service.ts` - Service layer with DTO validation
- `app.module.ts` - NestJS module setup

## Key Points

1. **DTOs are automatically validated** by class-validator decorators
2. **Swagger documentation** is automatically generated from decorators
3. **Type safety** is maintained throughout the request/response cycle

## Usage

After running `npx prisma generate`, import DTOs:

```typescript
import { CreateUserDto, UpdateUserDto, ReadUserDto } from './dto'
```

Use them in controllers and services with full type safety and validation.

