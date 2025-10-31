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

    it('should throw error when enum exists in map but value is null', () => {
      // Create a scenario where enum is in map but get() returns undefined
      // This tests the defensive check for null enumInfo
      const emptyEnumMapper = new TypeMapper([])
      
      // Manually add a null entry to test the defensive check
      // This is a defensive code path that should not happen in practice
      const field: FieldInfo = {
        name: 'role',
        type: 'SomeEnum',
        isOptional: false,
        isNullable: false,
        isArray: false,
        isUpdatedAt: false,
        hasDefault: false,
        isId: false,
        isRelation: false,
        enumName: 'SomeEnum'
      }

      // Mock the get method to return undefined even though enumName is set
      // This tests the second error throw in the code
      const mockMap = new Map<string, EnumInfo>()
      mockMap.set('SomeEnum', undefined as any)
      Object.defineProperty(emptyEnumMapper, 'enums', {
        value: mockMap,
        writable: true
      })

      expect(() => emptyEnumMapper.mapField(field)).toThrow('Enum SomeEnum not found')
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
        name: 'url',
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

    it('should map field ending with Id as UUID', () => {
      const field: FieldInfo = {
        name: 'userId',
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
        validator: 'IsUUID',
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should map id field as UUID', () => {
      const field: FieldInfo = {
        name: 'id',
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
        validator: 'IsUUID',
        isOptional: false,
        isNullable: false,
        isArray: false
      })
    })

    it('should map array enum field correctly', () => {
      const field: FieldInfo = {
        name: 'roles',
        type: 'UserRole',
        isOptional: false,
        isNullable: false,
        isArray: true,
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
        validatorOptions: { each: true },
        isOptional: false,
        isNullable: false,
        isArray: true
      })
    })

    it('should map unknown type with fallback', () => {
      const field: FieldInfo = {
        name: 'unknownField',
        type: 'UnknownType',
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

    it('should handle nullable boolean field correctly', () => {
      const field: FieldInfo = {
        name: 'isActive',
        type: 'Boolean',
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
        tsType: 'boolean',
        swaggerType: 'boolean',
        validator: 'IsBoolean',
        isOptional: true,
        isNullable: true,
        isArray: false
      })
    })
  })

  describe('getEnumImports', () => {
    it('should return all enum names', () => {
      const result = typeMapper.getEnumImports()
      expect(result).toEqual(['UserRole', 'Status'])
    })

    it('should return empty array when no enums', () => {
      const emptyMapper = new TypeMapper([])
      const result = emptyMapper.getEnumImports()
      expect(result).toEqual([])
    })
  })

  describe('getEnums', () => {
    it('should return enums map', () => {
      const enums = typeMapper.getEnums()
      expect(enums).toBeInstanceOf(Map)
      expect(enums.has('UserRole')).toBe(true)
      expect(enums.has('Status')).toBe(true)
    })
  })
})
