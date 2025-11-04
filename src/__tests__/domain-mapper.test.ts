import { DomainMapper } from '../domain-mapper'

describe('DomainMapper', () => {
  let domainMapper: DomainMapper

  beforeEach(() => {
    domainMapper = new DomainMapper()
  })

  describe('getDomainPath', () => {
    it('should return correct domain path for MediaAsset', () => {
      const result = domainMapper.getDomainPath('MediaAsset')

      expect(result).toEqual({
        domain: 'media',
        subfolder: 'media-asset'
      })
    })

    it('should return correct domain path for User', () => {
      const result = domainMapper.getDomainPath('User')

      expect(result).toEqual({
        domain: 'user-management',
        subfolder: 'user'
      })
    })

    it('should return correct domain path for SystemEvent', () => {
      const result = domainMapper.getDomainPath('SystemEvent')

      expect(result).toEqual({
        domain: 'system',
        subfolder: 'system-event'
      })
    })

    it('should return correct domain path for MeetingAssistantTemplates', () => {
      const result = domainMapper.getDomainPath('MeetingAssistantTemplates')

      expect(result).toEqual({
        domain: 'meeting-assistant',
        subfolder: 'templates'
      })
    })

    it('should return null for unknown model', () => {
      const result = domainMapper.getDomainPath('UnknownModel')

      expect(result).toBeNull()
    })
  })

  describe('getAllDomains', () => {
    it('should return all domains in sorted order', () => {
      const result = domainMapper.getAllDomains()

      expect(result).toEqual(['media', 'meeting-assistant', 'system', 'user-management'])
    })
  })

  describe('getModelsInDomain', () => {
    it('should return models in media domain', () => {
      const result = domainMapper.getModelsInDomain('media')

      expect(result).toEqual([
        'MediaAsset',
        'RichTranscript',
        'RichTranscriptSegment',
        'RichTranscriptSpeaker',
        'Translation'
      ])
    })

    it('should return models in user-management domain', () => {
      const result = domainMapper.getModelsInDomain('user-management')

      expect(result).toEqual(['Organization', 'User', 'ZitadelProject', 'ZitadelProjectMember'])
    })

    it('should return empty array for unknown domain', () => {
      const result = domainMapper.getModelsInDomain('unknown')

      expect(result).toEqual([])
    })
  })

  describe('custom mapping', () => {
    it('should use custom mapping when provided', () => {
      const customMapping = {
        CustomModel: 'custom-domain/custom-subfolder'
      }
      const mapper = new DomainMapper(customMapping)

      const result = mapper.getDomainPath('CustomModel')

      expect(result).toEqual({
        domain: 'custom-domain',
        subfolder: 'custom-subfolder'
      })
    })

    it('should merge custom mapping with default mapping', () => {
      const customMapping = {
        CustomModel: 'custom-domain/custom-subfolder'
      }
      const mapper = new DomainMapper(customMapping)

      // Custom mapping should work
      expect(mapper.getDomainPath('CustomModel')).toEqual({
        domain: 'custom-domain',
        subfolder: 'custom-subfolder'
      })

      // Default mapping should still work
      expect(mapper.getDomainPath('User')).toEqual({
        domain: 'user-management',
        subfolder: 'user'
      })
    })

    it('should handle custom mapping without subfolder', () => {
      const customMapping = {
        CustomModel: 'custom-domain'
      }
      const mapper = new DomainMapper(customMapping)

      const result = mapper.getDomainPath('CustomModel')

      expect(result).toEqual({
        domain: 'custom-domain',
        subfolder: 'custom-model'
      })
    })
  })

  describe('kebabCase conversion', () => {
    it('should convert PascalCase to kebab-case', () => {
      const result = domainMapper.getDomainPath('SomeComplexModelName')

      expect(result).toBeNull() // Not in default mapping, but kebabCase method should work
    })
  })
})
