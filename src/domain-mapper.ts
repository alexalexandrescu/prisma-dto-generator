import type { DomainMapping } from './types'

export class DomainMapper {
  private domainMapping: DomainMapping

  constructor(customMapping?: Record<string, string>) {
    this.domainMapping = this.buildDefaultMapping(customMapping)
  }

  private buildDefaultMapping(customMapping?: Record<string, string>): DomainMapping {
    // No default mappings - all mappings must be explicitly provided via config
    // This makes the package generic and reusable by any project
    const mapping: DomainMapping = {}

    // Apply custom mappings if provided
    if (customMapping) {
      for (const [modelName, domainPath] of Object.entries(customMapping)) {
        const [domain, subfolder] = domainPath.split('/')
        mapping[modelName] = { domain, subfolder }
      }
    }

    return mapping
  }

  getDomainPath(modelName: string): { domain: string; subfolder: string } | null {
    const mapping = this.domainMapping[modelName]
    if (!mapping) {
      return null
    }

    return {
      domain: mapping.domain,
      subfolder: mapping.subfolder || this.kebabCase(modelName)
    }
  }

  private kebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase()
  }

  getAllDomains(): string[] {
    const domains = new Set<string>()
    for (const mapping of Object.values(this.domainMapping)) {
      domains.add(mapping.domain)
    }
    return Array.from(domains).sort()
  }

  getModelsInDomain(domain: string): string[] {
    return Object.entries(this.domainMapping)
      .filter(([, mapping]) => mapping.domain === domain)
      .map(([modelName]) => modelName)
      .sort()
  }
}
