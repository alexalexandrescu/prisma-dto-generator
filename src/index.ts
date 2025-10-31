#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'
import { generatorHandler } from '@prisma/generator-helper'
import { DMMFParser } from './dmmf-parser'
import { DTOGenerator } from './dto-generator'
import type { GeneratorConfig } from './types'

generatorHandler({
  onManifest() {
    return {
      version: '0.1.0',
      defaultOutput: '../generated/dto',
      prettyName: 'NestJS DTO Generator'
    }
  },
  onGenerate: async (options) => {
    const { dmmf, generator } = options

    // Parse generator config
    const config: GeneratorConfig = {
      emitBarrel: generator.config.emitBarrel === 'true',
      relations: (generator.config.relations as string as 'omit' | 'ids' | 'nested') || 'ids',
      dateStrategy: (generator.config.dateStrategy as string as 'iso-string' | 'date') || 'iso-string',
      jsonType: (generator.config.jsonType as string) || 'Record<string, unknown>',
      fileNaming: (generator.config.fileNaming as string as 'kebab' | 'camel' | 'pascal') || 'kebab',
      heuristics: generator.config.heuristics === 'true',
      folderStructure: (generator.config.folderStructure as string as 'flat' | 'domain') || 'flat',
      clean: generator.config.clean === 'true'
    }

    // Parse omitFields if provided
    if (generator.config.omitFields) {
      try {
        const omitFieldsValue = Array.isArray(generator.config.omitFields)
          ? generator.config.omitFields[0]
          : generator.config.omitFields
        config.omitFields = JSON.parse(omitFieldsValue)
      } catch (error) {
        console.warn('Failed to parse omitFields config:', error)
      }
    }

    // Parse readDtoInclude if provided
    if (generator.config.readDtoInclude) {
      try {
        const readDtoIncludeValue = Array.isArray(generator.config.readDtoInclude)
          ? generator.config.readDtoInclude[0]
          : generator.config.readDtoInclude
        config.readDtoInclude = JSON.parse(readDtoIncludeValue)
      } catch (error) {
        console.warn('Failed to parse readDtoInclude config:', error)
      }
    }

    // Parse domainMapping if provided
    if (generator.config.domainMapping) {
      try {
        const domainMappingValue = Array.isArray(generator.config.domainMapping)
          ? generator.config.domainMapping[0]
          : generator.config.domainMapping
        const parsed = JSON.parse(domainMappingValue)
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          config.domainMapping = parsed
        } else {
          console.warn('Invalid domainMapping config: expected JSON object. Got:', typeof parsed)
        }
      } catch (error) {
        console.warn('Failed to parse domainMapping config:', error)
      }
    }

    // Parse DMMF
    const parser = new DMMFParser()
    const { models, enums } = parser.parse(dmmf)

    // Ensure output directory exists
    const outputDir = generator.output?.value || '../generated/dto'

    // Clean output directory if clean option is enabled
    if (config.clean && fs.existsSync(outputDir)) {
      console.log(`Cleaning output directory: ${outputDir}`)
      fs.rmSync(outputDir, { recursive: true, force: true })
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Generate DTOs
    const generator_instance = new DTOGenerator(config, enums)
    const files = generator_instance.generateDTOs(models)

    // Write files
    for (const file of files) {
      let filePath = outputDir

      // Add folder path if specified
      if (file.folderPath) {
        filePath = path.join(filePath, file.folderPath)

        // Ensure the folder exists
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath, { recursive: true })
        }
      }

      filePath = path.join(filePath, file.fileName)
      fs.writeFileSync(filePath, file.content, 'utf8')
    }

    console.log(`Generated ${files.length} DTO files in ${outputDir}`)
  }
})
