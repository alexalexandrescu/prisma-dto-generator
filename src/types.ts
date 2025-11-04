export interface GeneratorConfig {
  emitBarrel?: boolean
  omitFields?: Record<string, string[]>
  relations?: 'omit' | 'ids' | 'nested'
  dateStrategy?: 'iso-string' | 'date'
  jsonType?: string
  fileNaming?: 'kebab' | 'camel' | 'pascal'
  readDtoInclude?: Record<string, string[]>
  heuristics?: boolean
  folderStructure?: 'flat' | 'domain'
  domainMapping?: Record<string, string>
  clean?: boolean
}

export interface FieldMapping {
  tsType: string
  swaggerType: string
  swaggerFormat?: string
  validator: string
  validatorOptions?: Record<string, unknown>
  isArray?: boolean
  isOptional?: boolean
  isNullable?: boolean
  isReadOnly?: boolean
  enumName?: string
  enumValues?: string[]
}

export interface ModelInfo {
  name: string
  fields: FieldInfo[]
  enums: EnumInfo[]
}

export interface FieldInfo {
  name: string
  type: string
  isOptional: boolean
  isNullable: boolean
  isArray: boolean
  isUpdatedAt: boolean
  hasDefault: boolean
  isId: boolean
  isRelation: boolean
  relationName?: string
  relationType?: 'one' | 'many'
  enumName?: string
  enumValues?: string[]
}

export interface EnumInfo {
  name: string
  values: string[]
}

export interface DTOFile {
  fileName: string
  content: string
  folderPath?: string
}

export interface DomainMapping {
  [modelName: string]: {
    domain: string
    subfolder?: string
  }
}
