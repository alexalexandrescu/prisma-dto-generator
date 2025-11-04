import { TypeMapper } from '../type-mapper'
import type { EnumInfo, FieldInfo } from '../types'

describe('TypeMapper', () => {
  let typeMapper: TypeMapper
  const mockEnums: EnumInfo[] = [
    { name: 'UserRole', values: ['ADMIN', 'USER', 'GUEST'] },
    { name: 'Status', values: ['ACTIVE', 'INACTIVE', 'PENDING'] }
  ]

  beforeEach(() => {
    typeMapper = new TypeMapper(mockEnums)
  })

  describe('constructor', () => {
    it('should use default empty array when no enums provided', () => {
      const mapper = new TypeMapper()
      expect(mapper.getEnums().size).toBe(0)
      expect(mapper.getEnumImports()).toEqual([])
    })
  })

  describe('mapField', () => {
    it('should map string field correctly', () => {
      const field: FieldInfo = {
        name: 'name',
        type: 'String',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'string',
        swaggerType: 'string',
        validator: 'IsString',
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should map optional string field correctly', () => {
      const field: FieldInfo = {
        name: 'description',
        type: 'String',
        isOptional: true,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'string',
        swaggerType: 'string',
        validator: 'IsString',
        isOptional: true,
        isNullable: false,
        isArray: false
      })
    })

    it('should map nullable string field correctly', () => {
      const field: FieldInfo = {
        name: 'media',
        type: 'String',
        isOptional: true,
        isNullable: true,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'string',
        swaggerType: 'string',
        validator: 'IsString',
        isOptional: true,
        isNullable: true,
        isArray: false
      })
    })

    it('should map email field with IsEmail validator', () => {
      const field: FieldInfo = {
        name: 'email',
        type: 'String',
        isOptional: true,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'string',
        swaggerType: 'string',
        validator: 'IsEmail',
        isOptional: true,
        isNullable: false,
        isArray: false
      })
    })

    it('should map enum field correctly', () => {
      const field: FieldInfo = {
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
        enumValues: ['ADMIN', 'USER', 'GUEST']
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'UserRole',
        swaggerType: 'UserRole',
        validator: 'IsEnum',
        enumName: 'UserRole',
        enumValues: ['ADMIN', 'USER', 'GUEST'],
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should map array field correctly', () => {
      const field: FieldInfo = {
        name: 'tags',
        type: 'String',
        isOptional: false,
        isNullable: false,
        isArray: true,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'string',
        swaggerType: 'string',
        validator: 'IsString',
        validatorOptions: { each: true },
        isOptional: false,
        isNullable: false,
        isArray: true
      })
    })

    it('should map integer field correctly', () => {
      const field: FieldInfo = {
        name: 'age',
        type: 'Int',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'number',
        swaggerType: 'integer',
        swaggerFormat: 'int32',
        validator: 'IsInt',
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should map boolean field correctly', () => {
      const field: FieldInfo = {
        name: 'isActive',
        type: 'Boolean',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'boolean',
        swaggerType: 'boolean',
        validator: 'IsBoolean',
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should map JSON field correctly', () => {
      const field: FieldInfo = {
        name: 'metadata',
        type: 'Json',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'Record<string, unknown>',
        swaggerType: 'object',
        swaggerFormat: 'object',
        validator: 'IsObject',
        validatorOptions: undefined,
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should map DateTime field correctly', () => {
      const field: FieldInfo = {
        name: 'createdAt',
        type: 'DateTime',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'string',
        swaggerType: 'string',
        swaggerFormat: 'date-time',
        validator: 'IsDateString',
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should throw error for unknown enum', () => {
      const field: FieldInfo = {
        name: 'role',
        type: 'UnknownEnum',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false,
        enumName: 'UnknownEnum'
      }

      expect(() => typeMapper.mapField(field)).toThrow('Enum UnknownEnum not found')
    })

    it('should map BigInt field correctly', () => {
      const field: FieldInfo = {
        name: 'bigNumber',
        type: 'BigInt',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'string',
        swaggerType: 'string',
        swaggerFormat: 'bigint',
        validator: 'IsString',
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should map Float field correctly', () => {
      const field: FieldInfo = {
        name: 'price',
        type: 'Float',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'number',
        swaggerType: 'number',
        swaggerFormat: 'float',
        validator: 'IsNumber',
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should map Decimal field correctly', () => {
      const field: FieldInfo = {
        name: 'amount',
        type: 'Decimal',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'string',
        swaggerType: 'string',
        swaggerFormat: 'decimal',
        validator: 'IsString',
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should map Bytes field correctly', () => {
      const field: FieldInfo = {
        name: 'data',
        type: 'Bytes',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'string',
        swaggerType: 'string',
        swaggerFormat: 'byte',
        validator: 'IsString',
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should map URL field with IsUrl validator', () => {
      const field: FieldInfo = {
        name: 'websiteUrl',
        type: 'String',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'string',
        swaggerType: 'string',
        validator: 'IsUrl',
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should map unknown type with fallback', () => {
      const field: FieldInfo = {
        name: 'customField',
        type: 'UnknownType' as any,
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false
      }

      const result = typeMapper.mapField(field)

      expect(result).toEqual({
        tsType: 'any',
        swaggerType: 'string',
        validator: 'IsString',
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should handle enum not found after Map.get returns undefined', () => {
      // Create a TypeMapper with empty enums
      const emptyMapper = new TypeMapper([])
      const field: FieldInfo = {
        name: 'role',
        type: 'UserRole',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false,
        enumName: 'UserRole'
      }

      // This should trigger the first error throw (line 30)
      expect(() => emptyMapper.mapField(field)).toThrow('Enum UserRole not found')
    })

    it('should handle enum not found when Map.get returns undefined despite has() returning true', () => {
      // Create a TypeMapper and manually manipulate the Map to create edge case
      const mapper = new TypeMapper([{ name: 'UserRole', values: ['ADMIN'] }])
      const field: FieldInfo = {
        name: 'role',
        type: 'UserRole',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false,
        enumName: 'UserRole'
      }

      // Manually set the value to undefined to trigger line 34
      const enumsMap = mapper.getEnums()
      enumsMap.set('UserRole', undefined as any)

      // This should trigger the second error throw (line 34)
      expect(() => mapper.mapField(field)).toThrow('Enum UserRole not found')
    })
  })

  describe('getEnumImports', () => {
    it('should return all enum names', () => {
      const result = typeMapper.getEnumImports()
      expect(result).toEqual(['UserRole', 'Status'])
    })
  })
})
