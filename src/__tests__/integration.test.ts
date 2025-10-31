import type { DMMF } from '@prisma/generator-helper'
import { DMMFParser } from '../dmmf-parser'
import { DTOGenerator } from '../dto-generator'

describe('Integration Tests', () => {
  describe('Full DMMF to DTOs workflow', () => {
    it('should process complete DMMF and generate all DTOs with flat structure', () => {
      const mockDMMF: DMMF.Document = {
        datamodel: {
          models: [
            {
              name: 'User',
              dbName: 'User',
              schema: 'public',
              primaryKey: { name: 'User_pkey', fields: ['id'] },
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  type: 'String',
                  isRequired: true,
                  isList: false,
                  isUnique: true,
                  isId: true,
                  isReadOnly: false,
                  hasDefaultValue: true,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Primary key'
                },
                {
                  name: 'name',
                  kind: 'scalar',
                  type: 'String',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'User name'
                },
                {
                  name: 'email',
                  kind: 'scalar',
                  type: 'String',
                  isRequired: false,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'User email'
                },
                {
                  name: 'role',
                  kind: 'enum',
                  type: 'UserRole',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'User role'
                },
                {
                  name: 'createdAt',
                  kind: 'scalar',
                  type: 'DateTime',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: true,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Creation timestamp'
                },
                {
                  name: 'updatedAt',
                  kind: 'scalar',
                  type: 'DateTime',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: true,
                  isGenerated: false,
                  isUpdatedAt: true,
                  documentation: 'Last update timestamp'
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'User model'
            },
            {
              name: 'MediaAsset',
              dbName: 'MediaAsset',
              schema: 'public',
              primaryKey: { name: 'MediaAsset_pkey', fields: ['id'] },
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  type: 'String',
                  isRequired: true,
                  isList: false,
                  isUnique: true,
                  isId: true,
                  isReadOnly: false,
                  hasDefaultValue: true,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Primary key'
                },
                {
                  name: 'name',
                  kind: 'scalar',
                  type: 'String',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Asset name'
                },
                {
                  name: 'metadata',
                  kind: 'scalar',
                  type: 'Json',
                  isRequired: false,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Asset metadata'
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'Media asset model'
            }
          ],
          enums: [
            {
              name: 'UserRole',
              values: [
                { name: 'ADMIN', dbName: 'ADMIN' },
                { name: 'USER', dbName: 'USER' },
                { name: 'GUEST', dbName: 'GUEST' }
              ],
              dbName: 'UserRole',
              documentation: 'User roles'
            }
          ],
          types: [],
          indexes: []
        },
        schema: {} as any,
        mappings: {} as any
      }

      // Parse DMMF
      const parser = new DMMFParser()
      const { models, enums } = parser.parse(mockDMMF)

      // Generate DTOs with flat structure
      const generator = new DTOGenerator({ folderStructure: 'flat' }, enums)
      const files = generator.generateDTOs(models)

      // Verify all expected files are generated
      expect(files).toHaveLength(8) // 2 models * 3 DTOs + enums + barrel

      // Verify User DTOs
      const userCreateFile = files.find((f) => f.fileName === 'create-user.dto.ts')
      const userUpdateFile = files.find((f) => f.fileName === 'update-user.dto.ts')
      const userReadFile = files.find((f) => f.fileName === 'read-user.dto.ts')

      expect(userCreateFile).toBeDefined()
      expect(userUpdateFile).toBeDefined()
      expect(userReadFile).toBeDefined()

      // Verify MediaAsset DTOs
      const mediaCreateFile = files.find((f) => f.fileName === 'create-media-asset.dto.ts')
      const mediaUpdateFile = files.find((f) => f.fileName === 'update-media-asset.dto.ts')
      const mediaReadFile = files.find((f) => f.fileName === 'read-media-asset.dto.ts')

      expect(mediaCreateFile).toBeDefined()
      expect(mediaUpdateFile).toBeDefined()
      expect(mediaReadFile).toBeDefined()

      // Verify enums file
      const enumsFile = files.find((f) => f.fileName === 'enums.ts')
      expect(enumsFile).toBeDefined()

      // Verify barrel file
      const barrelFile = files.find((f) => f.fileName === 'index.ts')
      expect(barrelFile).toBeDefined()

      // Verify content quality
      expect(userCreateFile?.content).toContain('export class CreateUserDto')
      expect(userCreateFile?.content).toContain('name: string')
      expect(userCreateFile?.content).toContain('email: string | null')
      expect(userCreateFile?.content).toContain('role: UserRole')
      expect(userCreateFile?.content).not.toContain('id:')
      expect(userCreateFile?.content).not.toContain('createdAt:')

      expect(userReadFile?.content).toContain('export class UserDto')
      expect(userReadFile?.content).toContain('id: string')
      expect(userReadFile?.content).toContain('createdAt: string')
      expect(userReadFile?.content).toContain('readOnly: true')

      expect(mediaCreateFile?.content).toContain('metadata: Record<string, unknown> | null')
      expect(mediaCreateFile?.content).toContain('additionalProperties: true')

      expect(enumsFile?.content).toContain('export enum UserRole')
      expect(enumsFile?.content).toContain("ADMIN = 'ADMIN'")

      expect(barrelFile?.content).toContain("export { CreateUserDto } from './create-user.dto'")
      expect(barrelFile?.content).toContain("export { CreateMediaAssetDto } from './create-media-asset.dto'")
    })

    it('should process complete DMMF and generate all DTOs with domain structure', () => {
      const mockDMMF: DMMF.Document = {
        datamodel: {
          models: [
            {
              name: 'User',
              dbName: 'User',
              schema: 'public',
              primaryKey: { name: 'User_pkey', fields: ['id'] },
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  type: 'String',
                  isRequired: true,
                  isList: false,
                  isUnique: true,
                  isId: true,
                  isReadOnly: false,
                  hasDefaultValue: true,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Primary key'
                },
                {
                  name: 'name',
                  kind: 'scalar',
                  type: 'String',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'User name'
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'User model'
            },
            {
              name: 'MediaAsset',
              dbName: 'MediaAsset',
              schema: 'public',
              primaryKey: { name: 'MediaAsset_pkey', fields: ['id'] },
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  type: 'String',
                  isRequired: true,
                  isList: false,
                  isUnique: true,
                  isId: true,
                  isReadOnly: false,
                  hasDefaultValue: true,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Primary key'
                },
                {
                  name: 'name',
                  kind: 'scalar',
                  type: 'String',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Asset name'
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'Media asset model'
            }
          ],
          enums: [],
          types: [],
          indexes: []
        },
        schema: {} as any,
        mappings: {} as any
      }

      // Parse DMMF
      const parser = new DMMFParser()
      const { models, enums } = parser.parse(mockDMMF)

      // Generate DTOs with domain structure
      const generator = new DTOGenerator({ folderStructure: 'domain' }, enums)
      const files = generator.generateDTOs(models)

      // Verify all expected files are generated (more files due to domain structure)
      expect(files.length).toBeGreaterThan(6)

      // Verify User DTOs are in user-management domain
      const userCreateFile = files.find((f) => f.fileName === 'create-user.dto.ts')
      expect(userCreateFile?.folderPath).toBe('user-management/user')

      // Verify MediaAsset DTOs are in media domain
      const mediaCreateFile = files.find((f) => f.fileName === 'create-media-asset.dto.ts')
      expect(mediaCreateFile?.folderPath).toBe('media/media-asset')

      // Verify domain barrel files
      const userManagementBarrelFile = files.find(
        (f) => f.fileName === 'index.ts' && f.folderPath === 'user-management'
      )
      const mediaBarrelFile = files.find((f) => f.fileName === 'index.ts' && f.folderPath === 'media')
      const mainBarrelFile = files.find((f) => f.fileName === 'index.ts' && !f.folderPath)

      expect(userManagementBarrelFile).toBeDefined()
      expect(mediaBarrelFile).toBeDefined()
      expect(mainBarrelFile).toBeDefined()

      // Verify subfolder barrel files
      const userSubfolderBarrelFile = files.find(
        (f) => f.fileName === 'index.ts' && f.folderPath === 'user-management/user'
      )
      const mediaSubfolderBarrelFile = files.find(
        (f) => f.fileName === 'index.ts' && f.folderPath === 'media/media-asset'
      )

      expect(userSubfolderBarrelFile).toBeDefined()
      expect(mediaSubfolderBarrelFile).toBeDefined()

      // Verify barrel file content
      expect(userManagementBarrelFile?.content).toContain("export * from './user'")
      expect(mediaBarrelFile?.content).toContain("export * from './media-asset'")
      expect(mainBarrelFile?.content).toContain("export * from './user-management'")
      expect(mainBarrelFile?.content).toContain("export * from './media'")
    })

    it('should handle complex field types and relationships', () => {
      const mockDMMF: DMMF.Document = {
        datamodel: {
          models: [
            {
              name: 'Post',
              dbName: 'Post',
              schema: 'public',
              primaryKey: { name: 'Post_pkey', fields: ['id'] },
              fields: [
                {
                  name: 'id',
                  kind: 'scalar',
                  type: 'String',
                  isRequired: true,
                  isList: false,
                  isUnique: true,
                  isId: true,
                  isReadOnly: false,
                  hasDefaultValue: true,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Primary key'
                },
                {
                  name: 'title',
                  kind: 'scalar',
                  type: 'String',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Post title'
                },
                {
                  name: 'content',
                  kind: 'scalar',
                  type: 'String',
                  isRequired: false,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Post content'
                },
                {
                  name: 'tags',
                  kind: 'scalar',
                  type: 'String',
                  isRequired: true,
                  isList: true,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Post tags'
                },
                {
                  name: 'isPublished',
                  kind: 'scalar',
                  type: 'Boolean',
                  isRequired: false,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Publication status'
                },
                {
                  name: 'viewCount',
                  kind: 'scalar',
                  type: 'Int',
                  isRequired: false,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'View count'
                },
                {
                  name: 'metadata',
                  kind: 'scalar',
                  type: 'Json',
                  isRequired: false,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Post metadata'
                },
                {
                  name: 'createdAt',
                  kind: 'scalar',
                  type: 'DateTime',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: true,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Creation timestamp'
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'Post model'
            }
          ],
          enums: [],
          types: [],
          indexes: []
        },
        schema: {} as any,
        mappings: {} as any
      }

      // Parse DMMF
      const parser = new DMMFParser()
      const { models, enums } = parser.parse(mockDMMF)

      // Generate DTOs
      const generator = new DTOGenerator({}, enums)
      const files = generator.generateDTOs(models)

      const createFile = files.find((f) => f.fileName === 'create-post.dto.ts')
      const readFile = files.find((f) => f.fileName === 'read-post.dto.ts')

      expect(createFile).toBeDefined()
      expect(readFile).toBeDefined()

      // Verify field types are correctly mapped
      expect(createFile?.content).toContain('title: string')
      expect(createFile?.content).toContain('content: string | null')
      expect(createFile?.content).toContain('tags: string[]')
      expect(createFile?.content).toContain('isPublished?: boolean')
      expect(createFile?.content).toContain('viewCount: number | null')
      expect(createFile?.content).toContain('metadata: Record<string, unknown> | null')

      // Verify validators are correctly applied
      expect(createFile?.content).toContain('@IsString()')
      expect(createFile?.content).toContain('@IsBoolean()')
      expect(createFile?.content).toContain('@IsInt()')
      expect(createFile?.content).toContain('@IsObject()')
      expect(createFile?.content).toContain('@IsString({ each: true })')

      // Verify Swagger decorators
      expect(createFile?.content).toContain('@ApiProperty')
      expect(createFile?.content).toContain('@ApiPropertyOptional')
      expect(createFile?.content).toContain('isArray: true')
      expect(createFile?.content).toContain('additionalProperties: true')
    })
  })
})
