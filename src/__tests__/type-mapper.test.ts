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
  })

  describe('getEnumImports', () => {
    it('should return all enum names', () => {
      const result = typeMapper.getEnumImports()
      expect(result).toEqual(['UserRole', 'Status'])
    })
  })
})
