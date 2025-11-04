import { DomainMapper } from '../domain-mapper'

describe('DomainMapper', () => {
  describe('getDomainPath', () => {
    it('should return null when no mappings provided', () => {
      const domainMapper = new DomainMapper()
      const result = domainMapper.getDomainPath('User')

      expect(result).toBeNull()
    })

    it('should return correct domain path when mapping provided', () => {
      const domainMapper = new DomainMapper({
        User: 'user-management/user',
        MediaAsset: 'media/media-asset'
      })

      expect(domainMapper.getDomainPath('User')).toEqual({
        domain: 'user-management',
        subfolder: 'user'
      })

      expect(domainMapper.getDomainPath('MediaAsset')).toEqual({
        domain: 'media',
        subfolder: 'media-asset'
      })
    })

    it('should return null for unknown model', () => {
      const domainMapper = new DomainMapper({
        User: 'user-management/user'
      })
      const result = domainMapper.getDomainPath('UnknownModel')

      expect(result).toBeNull()
    })
  })

  describe('getAllDomains', () => {
    it('should return all domains in sorted order', () => {
      const domainMapper = new DomainMapper({
        User: 'user-management/user',
        MediaAsset: 'media/media-asset',
        SystemEvent: 'system/system-event',
        MeetingAssistantTemplates: 'meeting-assistant/templates'
      })

      const result = domainMapper.getAllDomains()

      expect(result).toEqual(['media', 'meeting-assistant', 'system', 'user-management'])
    })

    it('should return empty array when no mappings provided', () => {
      const domainMapper = new DomainMapper()
      const result = domainMapper.getAllDomains()

      expect(result).toEqual([])
    })
  })

  describe('getModelsInDomain', () => {
    it('should return models in media domain', () => {
      const domainMapper = new DomainMapper({
        MediaAsset: 'media/media-asset',
        RichTranscript: 'media/rich-transcript',
        RichTranscriptSegment: 'media/rich-transcript-segment',
        RichTranscriptSpeaker: 'media/rich-transcript-speaker',
        Translation: 'media/translation'
      })

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
      const domainMapper = new DomainMapper({
        Organization: 'user-management/organization',
        User: 'user-management/user',
        ZitadelProject: 'user-management/zitadel-project',
        ZitadelProjectMember: 'user-management/zitadel-project-member'
      })

      const result = domainMapper.getModelsInDomain('user-management')

      expect(result).toEqual(['Organization', 'User', 'ZitadelProject', 'ZitadelProjectMember'])
    })

    it('should return empty array for unknown domain', () => {
      const domainMapper = new DomainMapper({
        User: 'user-management/user'
      })
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

    it('should support multiple mappings', () => {
      const mappings = {
        CustomModel: 'custom-domain/custom-subfolder',
        User: 'user-management/user'
      }
      const mapper = new DomainMapper(mappings)

      // Custom mapping should work
      expect(mapper.getDomainPath('CustomModel')).toEqual({
        domain: 'custom-domain',
        subfolder: 'custom-subfolder'
      })

      // User mapping should work
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
    it('should use kebab-case for subfolder when not provided', () => {
      const domainMapper = new DomainMapper({
        SomeComplexModelName: 'test-domain'
      })

      const result = domainMapper.getDomainPath('SomeComplexModelName')

      expect(result).toEqual({
        domain: 'test-domain',
        subfolder: 'some-complex-model-name'
      })
    })
  })
})
