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
  })
})
