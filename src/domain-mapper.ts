import type { DomainMapping } from './types'

export class DomainMapper {
  private domainMapping: DomainMapping

  constructor(customMapping?: Record<string, string>) {
    this.domainMapping = this.buildMapping(customMapping)
  }

  private buildMapping(customMapping?: Record<string, string>): DomainMapping {
    const mapping: DomainMapping = {}

    // Build mapping from provided configuration only (no defaults)
    if (customMapping) {
      for (const [modelName, domainPath] of Object.entries(customMapping)) {
        const parts = domainPath.split('/')
        const domain = parts[0]
        const subfolder = parts[1]

        if (!domain) {
          console.warn(`Invalid domain mapping for ${modelName}: "${domainPath}". Expected format: "domain/subfolder"`)
          continue
        }

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
