import type { DMMF } from '@prisma/generator-helper'
import { DMMFParser } from '../dmmf-parser'

describe('DMMFParser', () => {
  let parser: DMMFParser

  beforeEach(() => {
    parser = new DMMFParser()
  })

  describe('parse enums through full DMMF', () => {
    it('should parse enums correctly', () => {
      const mockDMMF: DMMF.Document = {
        datamodel: {
          models: [],
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
            },
            {
              name: 'Status',
              values: [
                { name: 'ACTIVE', dbName: 'ACTIVE' },
                { name: 'INACTIVE', dbName: 'INACTIVE' }
              ],
              dbName: 'Status',
              documentation: 'Status values'
            }
          ],
          types: [],
          indexes: []
        },
        schema: {} as any,
        mappings: {} as any
      }

      const result = parser.parse(mockDMMF)

      expect(result.enums).toEqual([
        {
          name: 'UserRole',
          values: ['ADMIN', 'USER', 'GUEST']
        },
        {
          name: 'Status',
          values: ['ACTIVE', 'INACTIVE']
        }
      ])
    })

    it('should handle empty enums array', () => {
      const mockDMMF: DMMF.Document = {
        datamodel: {
          models: [],
          enums: [],
          types: [],
          indexes: []
        },
        schema: {} as any,
        mappings: {} as any
      }

      const result = parser.parse(mockDMMF)
      expect(result.enums).toEqual([])
    })
  })

  describe('parse models through full DMMF', () => {
    it('should parse models with various field types correctly', () => {
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
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'User model'
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

      const result = parser.parse(mockDMMF)

      expect(result.models).toHaveLength(1)
      expect(result.models[0].name).toBe('User')
      expect(result.models[0].fields).toHaveLength(4)

      const idField = result.models[0].fields.find((f) => f.name === 'id')
      const nameField = result.models[0].fields.find((f) => f.name === 'name')
      const emailField = result.models[0].fields.find((f) => f.name === 'email')
      const roleField = result.models[0].fields.find((f) => f.name === 'role')

      expect(idField).toEqual({
        name: 'id',
        type: 'String',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: true,
        isRelation: false,
        enumName: undefined,
        enumValues: undefined,
        relationName: undefined,
        relationType: undefined
      })

      expect(nameField).toEqual({
        name: 'name',
        type: 'String',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false,
        enumName: undefined,
        enumValues: undefined,
        relationName: undefined,
        relationType: undefined
      })

      expect(emailField).toEqual({
        name: 'email',
        type: 'String',
        isOptional: true,
        isNullable: true,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false,
        enumName: undefined,
        enumValues: undefined,
        relationName: undefined,
        relationType: undefined
      })

      expect(roleField).toEqual({
        name: 'role',
        type: 'UserRole',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false,
        enumName: 'UserRole',
        enumValues: ['ADMIN', 'USER', 'GUEST'],
        relationName: undefined,
        relationType: undefined
      })
    })
  })

  describe('parse', () => {
    it('should parse complete DMMF correctly', () => {
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
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'User model'
            }
          ],
          enums: [
            {
              name: 'UserRole',
              values: [
                { name: 'ADMIN', dbName: 'ADMIN' },
                { name: 'USER', dbName: 'USER' }
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

      const result = parser.parse(mockDMMF)

      expect(result.models).toHaveLength(1)
      expect(result.models[0].name).toBe('User')
      expect(result.enums).toHaveLength(1)
      expect(result.enums[0].name).toBe('UserRole')
    })

    it('should parse relation fields correctly', () => {
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
                  name: 'posts',
                  kind: 'object',
                  type: 'Post',
                  isRequired: true,
                  isList: true,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  relationName: 'PostToUser',
                  documentation: 'User posts'
                },
                {
                  name: 'profile',
                  kind: 'object',
                  type: 'Profile',
                  isRequired: false,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false,
                  relationName: 'ProfileToUser',
                  documentation: 'User profile'
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'User model'
            }
          ],
          enums: [],
          types: [],
          indexes: []
        },
        schema: {} as any,
        mappings: {} as any
      }

      const result = parser.parse(mockDMMF)
      const postsField = result.models[0].fields.find((f) => f.name === 'posts')
      const profileField = result.models[0].fields.find((f) => f.name === 'profile')

      expect(postsField).toEqual({
        name: 'posts',
        type: 'Post',
        isOptional: false,
        isNullable: false,
        isArray: true,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: true,
        relationName: 'PostToUser',
        relationType: 'many',
        enumName: undefined,
        enumValues: undefined
      })

      expect(profileField).toEqual({
        name: 'profile',
        type: 'Profile',
        isOptional: true,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: true,
        relationName: 'ProfileToUser',
        relationType: 'one',
        enumName: undefined,
        enumValues: undefined
      })
    })

    it('should parse updatedAt field correctly', () => {
      const mockDMMF: DMMF.Document = {
        datamodel: {
          models: [
            {
              name: 'User',
              dbName: 'User',
              schema: 'public',
              primaryKey: { name: 'User_pkey', fields: ['updatedAt'] },
              fields: [
                {
                  name: 'updatedAt',
                  kind: 'scalar',
                  type: 'DateTime',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: true,
                  documentation: 'Updated timestamp'
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'User model'
            }
          ],
          enums: [],
          types: [],
          indexes: []
        },
        schema: {} as any,
        mappings: {} as any
      }

      const result = parser.parse(mockDMMF)
      const updatedAtField = result.models[0].fields[0]

      expect(updatedAtField.isUpdatedAt).toBe(true)
    })

    it('should parse fields with default values', () => {
      const mockDMMF: DMMF.Document = {
        datamodel: {
          models: [
            {
              name: 'User',
              dbName: 'User',
              schema: 'public',
              primaryKey: { name: 'User_pkey', fields: ['active'] },
              fields: [
                {
                  name: 'active',
                  kind: 'scalar',
                  type: 'Boolean',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: true,
                  default: true,
                  isGenerated: false,
                  isUpdatedAt: false,
                  documentation: 'Active status'
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'User model'
            }
          ],
          enums: [],
          types: [],
          indexes: []
        },
        schema: {} as any,
        mappings: {} as any
      }

      const result = parser.parse(mockDMMF)
      const activeField = result.models[0].fields[0]

      expect(activeField.hasDefault).toBe(true)
    })

    it('should handle Boolean fields correctly (not nullable)', () => {
      const mockDMMF: DMMF.Document = {
        datamodel: {
          models: [
            {
              name: 'User',
              dbName: 'User',
              schema: 'public',
              primaryKey: { name: 'User_pkey', fields: ['isActive'] },
              fields: [
                {
                  name: 'isActive',
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
                  documentation: 'Active status'
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'User model'
            }
          ],
          enums: [],
          types: [],
          indexes: []
        },
        schema: {} as any,
        mappings: {} as any
      }

      const result = parser.parse(mockDMMF)
      const isActiveField = result.models[0].fields[0]

      expect(isActiveField.isOptional).toBe(true)
      expect(isActiveField.isNullable).toBe(false) // Boolean optional fields are not nullable
    })

    it('should parse all numeric types correctly', () => {
      const mockDMMF: DMMF.Document = {
        datamodel: {
          models: [
            {
              name: 'Product',
              dbName: 'Product',
              schema: 'public',
              primaryKey: { name: 'Product_pkey', fields: ['intField'] },
              fields: [
                {
                  name: 'intField',
                  kind: 'scalar',
                  type: 'Int',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false
                },
                {
                  name: 'bigIntField',
                  kind: 'scalar',
                  type: 'BigInt',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false
                },
                {
                  name: 'floatField',
                  kind: 'scalar',
                  type: 'Float',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false
                },
                {
                  name: 'decimalField',
                  kind: 'scalar',
                  type: 'Decimal',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'Product model'
            }
          ],
          enums: [],
          types: [],
          indexes: []
        },
        schema: {} as any,
        mappings: {} as any
      }

      const result = parser.parse(mockDMMF)
      const fields = result.models[0].fields

      expect(fields.find((f) => f.name === 'intField')?.type).toBe('Int')
      expect(fields.find((f) => f.name === 'bigIntField')?.type).toBe('BigInt')
      expect(fields.find((f) => f.name === 'floatField')?.type).toBe('Float')
      expect(fields.find((f) => f.name === 'decimalField')?.type).toBe('Decimal')
    })

    it('should parse Json and Bytes types correctly', () => {
      const mockDMMF: DMMF.Document = {
        datamodel: {
          models: [
            {
              name: 'Config',
              dbName: 'Config',
              schema: 'public',
              primaryKey: { name: 'Config_pkey', fields: ['jsonField'] },
              fields: [
                {
                  name: 'jsonField',
                  kind: 'scalar',
                  type: 'Json',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false
                },
                {
                  name: 'bytesField',
                  kind: 'scalar',
                  type: 'Bytes',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  isUpdatedAt: false
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'Config model'
            }
          ],
          enums: [],
          types: [],
          indexes: []
        },
        schema: {} as any,
        mappings: {} as any
      }

      const result = parser.parse(mockDMMF)
      const fields = result.models[0].fields

      expect(fields.find((f) => f.name === 'jsonField')?.type).toBe('Json')
      expect(fields.find((f) => f.name === 'bytesField')?.type).toBe('Bytes')
    })

    it('should handle undefined isUpdatedAt field', () => {
      const mockDMMF: DMMF.Document = {
        datamodel: {
          models: [
            {
              name: 'User',
              dbName: 'User',
              schema: 'public',
              primaryKey: { name: 'User_pkey', fields: ['timestamp'] },
              fields: [
                {
                  name: 'timestamp',
                  kind: 'scalar',
                  type: 'DateTime',
                  isRequired: true,
                  isList: false,
                  isUnique: false,
                  isId: false,
                  isReadOnly: false,
                  hasDefaultValue: false,
                  isGenerated: false,
                  // isUpdatedAt is undefined (not set)
                  documentation: 'Timestamp'
                }
              ],
              uniqueFields: [],
              uniqueIndexes: [],
              documentation: 'User model'
            }
          ],
          enums: [],
          types: [],
          indexes: []
        },
        schema: {} as any,
        mappings: {} as any
      }

      const result = parser.parse(mockDMMF)
      const timestampField = result.models[0].fields[0]

      expect(timestampField.isUpdatedAt).toBe(false)
    })
  })
})
