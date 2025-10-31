import { DomainMapper } from '../domain-mapper'

describe('DomainMapper', () => {
  describe('getDomainPath', () => {
    it('should return null when no mappings are provided', () => {
      const mapper = new DomainMapper()
      const result = mapper.getDomainPath('AnyModel')

      expect(result).toBeNull()
    })

    it('should return correct domain path for mapped model', () => {
      const customMapping = {
        User: 'user-management/user'
      }
      const mapper = new DomainMapper(customMapping)

      const result = mapper.getDomainPath('User')

      expect(result).toEqual({
        domain: 'user-management',
        subfolder: 'user'
      })
    })

    it('should return null for unmapped model', () => {
      const customMapping = {
        User: 'user-management/user'
      }
      const mapper = new DomainMapper(customMapping)

      const result = mapper.getDomainPath('UnknownModel')

      expect(result).toBeNull()
    })

    it('should handle subfolder derived from model name when subfolder is missing', () => {
      const customMapping = {
        SomeModel: 'domain' // Only domain, no subfolder
      }
      const mapper = new DomainMapper(customMapping)

      const result = mapper.getDomainPath('SomeModel')

      expect(result).toEqual({
        domain: 'domain',
        subfolder: 'some-model' // Kebab-case of model name
      })
    })
  })

  describe('getAllDomains', () => {
    it('should return empty array when no mappings provided', () => {
      const mapper = new DomainMapper()
      const result = mapper.getAllDomains()

      expect(result).toEqual([])
    })

    it('should return all domains in sorted order', () => {
      const customMapping = {
        User: 'user-management/user',
        MediaAsset: 'media/media-asset',
        SystemEvent: 'system/system-event',
        Task: 'system/task'
      }
      const mapper = new DomainMapper(customMapping)

      const result = mapper.getAllDomains()

      expect(result).toEqual(['media', 'system', 'user-management'])
    })
  })

  describe('getModelsInDomain', () => {
    it('should return empty array when no mappings provided', () => {
      const mapper = new DomainMapper()
      const result = mapper.getModelsInDomain('any-domain')

      expect(result).toEqual([])
    })

    it('should return models in specified domain', () => {
      const customMapping = {
        User: 'user-management/user',
        Organization: 'user-management/organization',
        MediaAsset: 'media/media-asset'
      }
      const mapper = new DomainMapper(customMapping)

      const result = mapper.getModelsInDomain('user-management')

      expect(result).toEqual(['Organization', 'User'])
    })

    it('should return empty array for unknown domain', () => {
      const customMapping = {
        User: 'user-management/user'
      }
      const mapper = new DomainMapper(customMapping)

      const result = mapper.getModelsInDomain('unknown')

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

    it('should handle multiple custom mappings', () => {
      const customMapping = {
        Model1: 'domain1/subfolder1',
        Model2: 'domain2/subfolder2',
        Model3: 'domain1/subfolder3'
      }
      const mapper = new DomainMapper(customMapping)

      expect(mapper.getDomainPath('Model1')).toEqual({
        domain: 'domain1',
        subfolder: 'subfolder1'
      })
      expect(mapper.getDomainPath('Model2')).toEqual({
        domain: 'domain2',
        subfolder: 'subfolder2'
      })
      expect(mapper.getDomainPath('Model3')).toEqual({
        domain: 'domain1',
        subfolder: 'subfolder3'
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

    it('should ignore invalid mapping format', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const customMapping = {
        ValidModel: 'valid-domain/subfolder',
        InvalidModel: '' // Empty string should be ignored
      }
      const mapper = new DomainMapper(customMapping)

      expect(mapper.getDomainPath('ValidModel')).toEqual({
        domain: 'valid-domain',
        subfolder: 'subfolder'
      })
      expect(mapper.getDomainPath('InvalidModel')).toBeNull()

      consoleSpy.mockRestore()
    })
  })
})
