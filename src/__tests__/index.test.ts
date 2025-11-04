import * as fs from 'node:fs'
import * as path from 'node:path'
import { generatorHandler } from '@prisma/generator-helper'

// Mock the generator handler
jest.mock('@prisma/generator-helper', () => ({
  generatorHandler: jest.fn()
}))

// Mock fs module
jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn()
}))

// Mock path module
jest.mock('node:path', () => ({
  join: jest.fn((...args) => args.join('/'))
}))

describe('Generator Index', () => {
  const mockGeneratorHandler = generatorHandler as jest.MockedFunction<typeof generatorHandler>
  const mockFs = fs as jest.Mocked<typeof fs>
  const mockPath = path as jest.Mocked<typeof path>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('onManifest', () => {
    it('should return correct manifest', () => {
      // Get the onManifest function from the mocked handler
      const onManifest = mockGeneratorHandler.mock.calls[0]?.[0]?.onManifest

      if (onManifest) {
        const result = onManifest({} as any)

        expect(result).toEqual({
          version: '1.0.0',
          defaultOutput: '../generated/dto',
          prettyName: 'NestJS DTO Generator'
        })
      }
    })
  })

  describe('onGenerate', () => {
    it('should handle basic configuration', async () => {
      const mockOptions = {
        dmmf: {
          datamodel: {
            models: [],
            enums: [],
            types: [],
            indexes: []
          },
          schema: {},
          mappings: {}
        },
        generator: {
          config: {
            emitBarrel: 'true',
            relations: 'ids',
            dateStrategy: 'iso-string',
            jsonType: 'Record<string, unknown>',
            fileNaming: 'kebab',
            heuristics: 'true',
            folderStructure: 'flat'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockPath.join.mockImplementation((...args) => args.join('/'))

      // Get the onGenerate function from the mocked handler
      const onGenerate = mockGeneratorHandler.mock.calls[0]?.[0]?.onGenerate

      if (onGenerate) {
        await onGenerate(mockOptions as any)

        expect(mockFs.existsSync).toHaveBeenCalledWith('../generated/dto')
        expect(mockFs.mkdirSync).toHaveBeenCalledWith('../generated/dto', { recursive: true })
      }
    })

    it('should clean output directory when clean option is enabled', async () => {
      const mockOptions = {
        dmmf: {
          datamodel: {
            models: [],
            enums: [],
            types: [],
            indexes: []
          },
          schema: {},
          mappings: {}
        },
        generator: {
          config: {
            emitBarrel: 'true',
            relations: 'ids',
            dateStrategy: 'iso-string',
            jsonType: 'Record<string, unknown>',
            fileNaming: 'kebab',
            heuristics: 'true',
            folderStructure: 'flat',
            clean: 'true'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      // Mock that the output directory exists (so it should be cleaned)
      mockFs.existsSync.mockReturnValue(true)
      mockPath.join.mockImplementation((...args) => args.join('/'))

      // Mock console.log to capture the clean message
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      // Get the onGenerate function from the mocked handler
      const onGenerate = mockGeneratorHandler.mock.calls[0]?.[0]?.onGenerate

      if (onGenerate) {
        await onGenerate(mockOptions as any)

        expect(mockFs.existsSync).toHaveBeenCalledWith('../generated/dto')
        expect(mockFs.rmSync).toHaveBeenCalledWith('../generated/dto', { recursive: true, force: true })
        expect(consoleSpy).toHaveBeenCalledWith('Cleaning output directory: ../generated/dto')
        expect(mockFs.mkdirSync).toHaveBeenCalledWith('../generated/dto', { recursive: true })
      }

      consoleSpy.mockRestore()
    })

    it('should not clean output directory when clean option is disabled', async () => {
      const mockOptions = {
        dmmf: {
          datamodel: {
            models: [],
            enums: [],
            types: [],
            indexes: []
          },
          schema: {},
          mappings: {}
        },
        generator: {
          config: {
            emitBarrel: 'true',
            relations: 'ids',
            dateStrategy: 'iso-string',
            jsonType: 'Record<string, unknown>',
            fileNaming: 'kebab',
            heuristics: 'true',
            folderStructure: 'flat',
            clean: 'false'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      // Mock that the output directory exists
      mockFs.existsSync.mockReturnValue(true)
      mockPath.join.mockImplementation((...args) => args.join('/'))

      // Get the onGenerate function from the mocked handler
      const onGenerate = mockGeneratorHandler.mock.calls[0]?.[0]?.onGenerate

      if (onGenerate) {
        await onGenerate(mockOptions as any)

        expect(mockFs.existsSync).toHaveBeenCalledWith('../generated/dto')
        expect(mockFs.rmSync).not.toHaveBeenCalled()
        expect(mockFs.mkdirSync).not.toHaveBeenCalled() // Directory already exists
      }
    })

    it('should not clean output directory when clean option is not specified', async () => {
      const mockOptions = {
        dmmf: {
          datamodel: {
            models: [],
            enums: [],
            types: [],
            indexes: []
          },
          schema: {},
          mappings: {}
        },
        generator: {
          config: {
            emitBarrel: 'true',
            relations: 'ids',
            dateStrategy: 'iso-string',
            jsonType: 'Record<string, unknown>',
            fileNaming: 'kebab',
            heuristics: 'true',
            folderStructure: 'flat'
            // clean option not specified
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      // Mock that the output directory exists
      mockFs.existsSync.mockReturnValue(true)
      mockPath.join.mockImplementation((...args) => args.join('/'))

      // Get the onGenerate function from the mocked handler
      const onGenerate = mockGeneratorHandler.mock.calls[0]?.[0]?.onGenerate

      if (onGenerate) {
        await onGenerate(mockOptions as any)

        expect(mockFs.existsSync).toHaveBeenCalledWith('../generated/dto')
        expect(mockFs.rmSync).not.toHaveBeenCalled()
        expect(mockFs.mkdirSync).not.toHaveBeenCalled() // Directory already exists
      }
    })

    it('should handle domain structure configuration', async () => {
      const mockOptions = {
        dmmf: {
          datamodel: {
            models: [
              {
                name: 'User',
                dbName: 'User',
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
            enums: [],
            types: []
          },
          schema: {},
          mappings: {}
        },
        generator: {
          config: {
            emitBarrel: 'true',
            relations: 'ids',
            dateStrategy: 'iso-string',
            jsonType: 'Record<string, unknown>',
            fileNaming: 'kebab',
            heuristics: 'true',
            folderStructure: 'domain'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockPath.join.mockImplementation((...args) => args.join('/'))

      // Get the onGenerate function from the mocked handler
      const onGenerate = mockGeneratorHandler.mock.calls[0]?.[0]?.onGenerate

      if (onGenerate) {
        await onGenerate(mockOptions as any)

        expect(mockFs.existsSync).toHaveBeenCalledWith('../generated/dto')
        expect(mockFs.mkdirSync).toHaveBeenCalledWith('../generated/dto', { recursive: true })
        expect(mockFs.writeFileSync).toHaveBeenCalled()
      }
    })

    it('should handle omitFields configuration', async () => {
      const mockOptions = {
        dmmf: {
          datamodel: {
            models: [],
            enums: [],
            types: [],
            indexes: []
          },
          schema: {},
          mappings: {}
        },
        generator: {
          config: {
            emitBarrel: 'true',
            relations: 'ids',
            dateStrategy: 'iso-string',
            jsonType: 'Record<string, unknown>',
            fileNaming: 'kebab',
            heuristics: 'true',
            folderStructure: 'flat',
            omitFields: '{"User": ["email"]}'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockPath.join.mockImplementation((...args) => args.join('/'))

      // Get the onGenerate function from the mocked handler
      const onGenerate = mockGeneratorHandler.mock.calls[0]?.[0]?.onGenerate

      if (onGenerate) {
        await onGenerate(mockOptions as any)

        expect(mockFs.existsSync).toHaveBeenCalledWith('../generated/dto')
        expect(mockFs.mkdirSync).toHaveBeenCalledWith('../generated/dto', { recursive: true })
      }
    })

    it('should handle readDtoInclude configuration', async () => {
      const mockOptions = {
        dmmf: {
          datamodel: {
            models: [],
            enums: [],
            types: [],
            indexes: []
          },
          schema: {},
          mappings: {}
        },
        generator: {
          config: {
            emitBarrel: 'true',
            relations: 'ids',
            dateStrategy: 'iso-string',
            jsonType: 'Record<string, unknown>',
            fileNaming: 'kebab',
            heuristics: 'true',
            folderStructure: 'flat',
            readDtoInclude: '{"User": ["posts"]}'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockPath.join.mockImplementation((...args) => args.join('/'))

      // Get the onGenerate function from the mocked handler
      const onGenerate = mockGeneratorHandler.mock.calls[0]?.[0]?.onGenerate

      if (onGenerate) {
        await onGenerate(mockOptions as any)

        expect(mockFs.existsSync).toHaveBeenCalledWith('../generated/dto')
        expect(mockFs.mkdirSync).toHaveBeenCalledWith('../generated/dto', { recursive: true })
      }
    })

    it('should handle invalid JSON configuration gracefully', async () => {
      const mockOptions = {
        dmmf: {
          datamodel: {
            models: [],
            enums: [],
            types: [],
            indexes: []
          },
          schema: {},
          mappings: {}
        },
        generator: {
          config: {
            emitBarrel: 'true',
            relations: 'ids',
            dateStrategy: 'iso-string',
            jsonType: 'Record<string, unknown>',
            fileNaming: 'kebab',
            heuristics: 'true',
            folderStructure: 'flat',
            omitFields: 'invalid-json'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockPath.join.mockImplementation((...args) => args.join('/'))

      // Mock console.warn to avoid test output
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      // Get the onGenerate function from the mocked handler
      const onGenerate = mockGeneratorHandler.mock.calls[0]?.[0]?.onGenerate

      if (onGenerate) {
        await onGenerate(mockOptions as any)

        expect(consoleSpy).toHaveBeenCalledWith('Failed to parse omitFields config:', expect.any(Error))
      }

      consoleSpy.mockRestore()
    })

    it('should create nested directories for domain structure', async () => {
      const mockOptions = {
        dmmf: {
          datamodel: {
            models: [
              {
                name: 'User',
                dbName: 'User',
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
            enums: [],
            types: []
          },
          schema: {},
          mappings: {}
        },
        generator: {
          config: {
            emitBarrel: 'true',
            relations: 'ids',
            dateStrategy: 'iso-string',
            jsonType: 'Record<string, unknown>',
            fileNaming: 'kebab',
            heuristics: 'true',
            folderStructure: 'domain'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      // Mock that the main directory exists but subdirectories don't
      mockFs.existsSync.mockImplementation((path) => {
        if (path === '../generated/dto') return true
        if (String(path).includes('user-management')) return false
        return true
      })
      mockPath.join.mockImplementation((...args) => args.join('/'))

      // Get the onGenerate function from the mocked handler
      const onGenerate = mockGeneratorHandler.mock.calls[0]?.[0]?.onGenerate

      if (onGenerate) {
        await onGenerate(mockOptions as any)

        // Should create the user-management directory
        expect(mockFs.mkdirSync).toHaveBeenCalledWith('../generated/dto/user-management', { recursive: true })
      }
    })
  })
})
