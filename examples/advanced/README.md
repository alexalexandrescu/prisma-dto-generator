# Advanced Example

This example demonstrates advanced configuration with:
- Domain-based folder structure
- Custom domain mappings
- Field omission
- Complex relations and enums

## Configuration

```prisma
generator nestdto {
  provider        = "prisma-nest-dto-generator"
  output          = "./generated"
  folderStructure = "domain"
  domainMapping   = "{\"User\": \"users/user\", \"Post\": \"content/post\", \"Comment\": \"content/comment\"}"
  relations       = "ids"
  omitFields      = "{\"User\": [\"password\", \"secretKey\"]}"
  heuristics      = "true"
}
```

## Domain Structure

DTOs are organized by domain:

```
generated/
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
    comment/
      create-comment.dto.ts
      update-comment.dto.ts
      read-comment.dto.ts
```

## Features Demonstrated

- **Domain Mapping**: Models organized into logical domains
- **Field Omission**: Sensitive fields excluded from Create/Update DTOs
- **Relation Handling**: Foreign keys included as IDs
- **Heuristics**: Email and URL fields automatically detected

