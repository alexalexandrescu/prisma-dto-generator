import * as fs from 'node:fs'
import * as path from 'node:path'
import { generatorHandler } from '@prisma/generator-helper'

// Mock the generator handler BEFORE importing index
jest.mock('@prisma/generator-helper', () => ({
  generatorHandler: jest.fn()
}))

// Mock fs module
jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  rmSync: jest.fn()
}))

// Mock path module
jest.mock('node:path', () => ({
  join: jest.fn((...args) => args.join('/')),
  dirname: jest.fn((p) => {
    if (typeof p === 'string') {
      return p.split('/').slice(0, -1).join('/')
    }
    return ''
  }),
  resolve: jest.fn((...args) => args.join('/'))
}))

// Import AFTER mocks are set up
import '../index'

describe('Generator Index', () => {
  const mockGeneratorHandler = generatorHandler as jest.MockedFunction<typeof generatorHandler>
  const mockFs = fs as jest.Mocked<typeof fs>
  const mockPath = path as jest.Mocked<typeof path>
  let handler: any

  beforeAll(() => {
    // Store the handler that was registered during module import
    expect(mockGeneratorHandler).toHaveBeenCalled()
    const handlerCall = mockGeneratorHandler.mock.calls[0]
    expect(handlerCall).toBeDefined()
    handler = handlerCall[0]
  })

  beforeEach(() => {
    // Clear individual mocks but preserve generator handler mock
    // The handler is stored in beforeAll, so we don't need to clear it
    mockFs.existsSync.mockClear()
    mockFs.mkdirSync.mockClear()
    mockFs.writeFileSync.mockClear()
    mockFs.readFileSync.mockClear()
    mockFs.rmSync.mockClear()
    mockPath.join.mockClear()
    mockPath.dirname.mockClear()
    mockPath.resolve.mockClear()
  })

  describe('onManifest', () => {
    it('should return correct manifest', () => {
      expect(handler.onManifest).toBeDefined()
      if (handler.onManifest) {
        const result = handler.onManifest({} as any)

        expect(result).toEqual({
          version: '0.0.1',
          defaultOutput: '../generated/dto',
          prettyName: 'NestJS DTO Generator'
        })
      }
    })
  })

  describe('onGenerate', () => {

    it('should handle basic configuration', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.existsSync).toHaveBeenCalledWith('../generated/dto')
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('../generated/dto', { recursive: true })
    })

    it('should use default config values when config properties are missing', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
          config: {},
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.existsSync).toHaveBeenCalledWith('../generated/dto')
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('../generated/dto', { recursive: true })
    })

    it('should clean output directory when clean option is enabled', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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

      // Mock existsSync to return true initially (directory exists), then false after rmSync
      let directoryExists = true
      mockFs.existsSync.mockImplementation(() => directoryExists)
      mockFs.rmSync.mockImplementation(() => {
        directoryExists = false
      })
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.existsSync).toHaveBeenCalledWith('../generated/dto')
      expect(mockFs.rmSync).toHaveBeenCalledWith('../generated/dto', { recursive: true, force: true })
      expect(consoleSpy).toHaveBeenCalledWith('Cleaning output directory: ../generated/dto')
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('../generated/dto', { recursive: true })

      consoleSpy.mockRestore()
    })

    it('should handle domainMapping from file path', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
            folderStructure: 'domain',
            domainMapping: './dto-domain-mapping.json'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      const mappingContent = JSON.stringify({ User: 'user-management/user' })
      mockFs.existsSync.mockImplementation((p) => {
        if (String(p).includes('dto-domain-mapping.json')) return true
        if (String(p) === '../generated/dto') return false
        return false
      })
      mockFs.readFileSync.mockReturnValue(mappingContent)
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')
      mockPath.resolve.mockImplementation((...args) => args.join('/'))

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.readFileSync).toHaveBeenCalled()
      expect(mockFs.existsSync).toHaveBeenCalled()
    })

    it('should handle domainMapping from JSON string', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
            folderStructure: 'domain',
            domainMapping: '{"User": "user-management/user"}'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.existsSync).toHaveBeenCalled()
    })

    it('should handle domainMapping with absolute path', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
            folderStructure: 'domain',
            domainMapping: '/absolute/path/to/mapping.json'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      const mappingContent = JSON.stringify({ User: 'user-management/user' })
      mockFs.existsSync.mockImplementation((p) => {
        if (String(p).includes('mapping.json')) return true
        if (String(p) === '../generated/dto') return false
        return false
      })
      mockFs.readFileSync.mockReturnValue(mappingContent)
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')
      mockPath.resolve.mockImplementation((...args) => args.join('/'))

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.readFileSync).toHaveBeenCalled()
    })

    it('should handle empty schemaPath', async () => {
      const mockOptions = {
        schemaPath: '',
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
            folderStructure: 'domain',
            domainMapping: './mapping.json'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('')
      mockPath.resolve.mockImplementation((...args) => args.join('/'))

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.existsSync).toHaveBeenCalled()
    })

    it('should handle domainMapping file not found', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
            folderStructure: 'domain',
            domainMapping: './non-existent.json'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockImplementation((p) => {
        if (String(p).includes('non-existent.json')) return false
        if (String(p) === '../generated/dto') return false
        return false
      })
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')
      mockPath.resolve.mockImplementation((...args) => args.join('/'))

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      await handler.onGenerate(mockOptions as any)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Domain mapping file not found')
      )

      consoleSpy.mockRestore()
    })

    it('should handle invalid omitFields JSON', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      await handler.onGenerate(mockOptions as any)

      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse omitFields config:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('should handle invalid readDtoInclude JSON', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
            readDtoInclude: 'invalid-json'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      await handler.onGenerate(mockOptions as any)

      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse readDtoInclude config:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('should handle invalid domainMapping JSON', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
            folderStructure: 'domain',
            domainMapping: 'invalid-json'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      await handler.onGenerate(mockOptions as any)

      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse domainMapping config:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('should handle omitFields as array', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
            omitFields: ['{"User": ["email"]}']
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.existsSync).toHaveBeenCalled()
    })

    it('should handle readDtoInclude as array', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
            readDtoInclude: ['{"User": ["posts"]}']
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.existsSync).toHaveBeenCalled()
    })

    it('should handle domainMapping as array', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
            folderStructure: 'domain',
            domainMapping: ['{"User": "user-management/user"}']
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.existsSync).toHaveBeenCalled()
    })

    it('should create nested directories for domain structure', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
            folderStructure: 'domain',
            domainMapping: '{"User": "user-management/user"}'
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockImplementation((p) => {
        const pathStr = String(p)
        if (pathStr === '../generated/dto') return false
        if (pathStr.includes('user-management')) return false
        return false
      })
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.mkdirSync).toHaveBeenCalled()
    })

    it('should handle output directory that already exists', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
            // clean is not set, so should not clean
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(true) // Directory exists
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.existsSync).toHaveBeenCalledWith('../generated/dto')
      expect(mockFs.rmSync).not.toHaveBeenCalled() // Should not clean
      expect(mockFs.mkdirSync).not.toHaveBeenCalled() // Should not recreate
    })

    it('should handle default output directory when not specified', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
            value: undefined as any
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.existsSync).toHaveBeenCalledWith('../generated/dto')
    })

    it('should handle clean option when directory does not exist', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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

      mockFs.existsSync.mockReturnValue(false) // Directory does not exist
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.existsSync).toHaveBeenCalledWith('../generated/dto')
      expect(mockFs.rmSync).not.toHaveBeenCalled() // Should not clean if doesn't exist
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('../generated/dto', { recursive: true })
    })

    it('should handle array config values', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
            omitFields: ['{"User": ["email"]}']
          },
          output: {
            value: '../generated/dto'
          }
        }
      }

      mockFs.existsSync.mockReturnValue(false)
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      await handler.onGenerate(mockOptions as any)

      expect(mockFs.existsSync).toHaveBeenCalled()
    })

    it('should log generated files count', async () => {
      const mockOptions = {
        schemaPath: '/path/to/schema.prisma',
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
      mockFs.writeFileSync.mockImplementation(() => {})
      mockPath.join.mockImplementation((...args) => args.join('/'))
      mockPath.dirname.mockReturnValue('/path/to')

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      await handler.onGenerate(mockOptions as any)

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/Generated \d+ DTO files in/))

      consoleSpy.mockRestore()
    })
  })
})
