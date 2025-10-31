import { DomainMapper } from './domain-mapper';
import { TypeMapper } from './type-mapper';
import type {
	DTOFile,
	EnumInfo,
	FieldInfo,
	GeneratorConfig,
	ModelInfo,
} from './types';

export class DTOGenerator {
	private typeMapper: TypeMapper;
	private domainMapper: DomainMapper;
	private config: GeneratorConfig;

	constructor(config: GeneratorConfig = {}, enums: EnumInfo[] = []) {
		this.config = {
			emitBarrel: true,
			relations: 'ids',
			dateStrategy: 'iso-string',
			jsonType: 'Record<string, unknown>',
			fileNaming: 'kebab',
			heuristics: true,
			folderStructure: 'flat',
			...config,
		};
		this.typeMapper = new TypeMapper(enums);
		this.domainMapper = new DomainMapper(config.domainMapping);
	}

	generateDTOs(models: ModelInfo[]): DTOFile[] {
		const files: DTOFile[] = [];

		// Generate enums file
		if (this.typeMapper.getEnumImports().length > 0) {
			files.push(this.generateEnumsFile());
		}

		// Generate DTOs for each model
		for (const model of models) {
			files.push(this.generateCreateDTO(model));
			files.push(this.generateUpdateDTO(model));
			files.push(this.generateReadDTO(model));
		}

		// Generate domain barrel files if using domain structure
		if (this.config.folderStructure === 'domain') {
			files.push(...this.generateDomainBarrelFiles(models));
		}

		// Generate main barrel file
		if (this.config.emitBarrel) {
			files.push(this.generateBarrelFile(models));
		}

		return files;
	}

	private generateCreateDTO(model: ModelInfo): DTOFile {
		const fields = this.getFieldsForCreate(model);
		const className = `Create${model.name}Dto`;
		const fileName = `create-${this.toKebabCase(model.name)}.dto.ts`;

		const imports = this.generateImports(fields);
		const properties = fields
			.map((field) => this.generateProperty(field, false))
			.join('\n\n  ');

		const content = `${imports}

export class ${className} {
  ${properties}
}
`;

		const folderPath = this.getFolderPath(model.name);
		return { fileName, content, folderPath };
	}

	private getFolderPath(modelName: string): string | undefined {
		if (this.config.folderStructure === 'flat') {
			return undefined;
		}

		const domainPath = this.domainMapper.getDomainPath(modelName);
		if (!domainPath) {
			return undefined;
		}

		return `${domainPath.domain}/${domainPath.subfolder}`;
	}

	private generateUpdateDTO(model: ModelInfo): DTOFile {
		const className = `Update${model.name}Dto`;
		const createClassName = `Create${model.name}Dto`;
		const fileName = `update-${this.toKebabCase(model.name)}.dto.ts`;

		const content = `import { PartialType } from '@nestjs/swagger';
import { ${createClassName} } from './create-${this.toKebabCase(model.name)}.dto';

export class ${className} extends PartialType(${createClassName}) {}
`;

		const folderPath = this.getFolderPath(model.name);
		return { fileName, content, folderPath };
	}

	private generateReadDTO(model: ModelInfo): DTOFile {
		const fields = this.getFieldsForRead(model);
		const className = `${model.name}Dto`;
		const fileName = `read-${this.toKebabCase(model.name)}.dto.ts`;

		const imports = this.generateImports(fields);
		const properties = fields
			.map((field) => this.generateProperty(field, true))
			.join('\n\n  ');

		const content = `${imports}

export class ${className} {
  ${properties}
}
`;

		const folderPath = this.getFolderPath(model.name);
		return { fileName, content, folderPath };
	}

	private generateEnumsFile(): DTOFile {
		const enums = this.typeMapper.getEnumImports();
		const enumDefinitions = enums
			.map((enumName) => {
				const enumInfo = this.typeMapper.getEnums().get(enumName);
				if (!enumInfo) return '';

				const enumValues = enumInfo.values
					.map((value) => `  ${value} = '${value}'`)
					.join(',\n');
				return `export enum ${enumName} {\n${enumValues}\n}`;
			})
			.filter(Boolean)
			.join('\n\n');

		return {
			fileName: 'enums.ts',
			content: enumDefinitions,
		};
	}

	private generateBarrelFile(models: ModelInfo[]): DTOFile {
		if (this.config.folderStructure === 'flat') {
			return this.generateFlatBarrelFile(models);
		}
		return this.generateDomainBarrelFile(models);
	}

	private generateFlatBarrelFile(models: ModelInfo[]): DTOFile {
		const exports = models.flatMap((model) => [
			`export { Create${model.name}Dto } from './create-${this.toKebabCase(model.name)}.dto';`,
			`export { Update${model.name}Dto } from './update-${this.toKebabCase(model.name)}.dto';`,
			`export { ${model.name}Dto } from './read-${this.toKebabCase(model.name)}.dto';`,
		]);

		if (this.typeMapper.getEnumImports().length > 0) {
			exports.push(`export * from './enums';`);
		}

		return {
			fileName: 'index.ts',
			content: exports.join('\n'),
		};
	}

	private generateDomainBarrelFile(models: ModelInfo[]): DTOFile {
		const domains = this.domainMapper.getAllDomains();
		const exports: string[] = [];

		// Export from each domain
		for (const domain of domains) {
			const domainModels = this.domainMapper.getModelsInDomain(domain);
			if (domainModels.length > 0) {
				exports.push(`export * from './${domain}';`);
			}
		}

		// Export enums if any
		if (this.typeMapper.getEnumImports().length > 0) {
			exports.push(`export * from './enums';`);
		}

		return {
			fileName: 'index.ts',
			content: exports.join('\n'),
		};
	}

	private generateDomainBarrelFiles(models: ModelInfo[]): DTOFile[] {
		const files: DTOFile[] = [];
		const domains = this.domainMapper.getAllDomains();

		for (const domain of domains) {
			const domainModels = this.domainMapper.getModelsInDomain(domain);
			if (domainModels.length === 0) continue;

			const exports: string[] = [];
			const subfolderGroups = new Map<string, string[]>();

			for (const modelName of domainModels) {
				const model = models.find((m) => m.name === modelName);
				if (!model) continue;

				const subfolder = this.domainMapper.getDomainPath(modelName)?.subfolder;
				if (subfolder) {
					if (!subfolderGroups.has(subfolder)) {
						subfolderGroups.set(subfolder, []);
					}
					subfolderGroups.get(subfolder)?.push(modelName);
				}
			}

			// Generate domain index file
			for (const [subfolder] of subfolderGroups) {
				exports.push(`export * from './${subfolder}';`);
			}

			files.push({
				fileName: 'index.ts',
				content: exports.join('\n'),
				folderPath: domain,
			});

			// Generate subfolder index files
			for (const [subfolder, modelNames] of subfolderGroups) {
				const subfolderExports: string[] = [];

				for (const modelName of modelNames) {
					subfolderExports.push(
						`export { Create${modelName}Dto } from './create-${this.toKebabCase(modelName)}.dto';`,
					);
					subfolderExports.push(
						`export { Update${modelName}Dto } from './update-${this.toKebabCase(modelName)}.dto';`,
					);
					subfolderExports.push(
						`export { ${modelName}Dto } from './read-${this.toKebabCase(modelName)}.dto';`,
					);
				}

				files.push({
					fileName: 'index.ts',
					content: subfolderExports.join('\n'),
					folderPath: `${domain}/${subfolder}`,
				});
			}
		}

		return files;
	}

	private getFieldsForCreate(model: ModelInfo): FieldInfo[] {
		const omitFields = this.config.omitFields?.[model.name] || [];
		const defaultOmits = ['id', 'createdAt', 'updatedAt'];

		return model.fields.filter(
			(field) =>
				!defaultOmits.includes(field.name) &&
				!omitFields.includes(field.name) &&
				!field.isUpdatedAt &&
				!field.isRelation,
		);
	}

	private getFieldsForRead(model: ModelInfo): FieldInfo[] {
		const omitFields = this.config.omitFields?.[model.name] || [];

		return model.fields.filter(
			(field) => !omitFields.includes(field.name) && !field.isRelation,
		);
	}

	private generateImports(fields: FieldInfo[]): string {
		const imports = new Set<string>();

		// Always include base imports
		imports.add(
			"import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';",
		);

		// Add validator imports based on field types
		const validators = new Set<string>();
		fields.forEach((field) => {
			const mapping = this.typeMapper.mapField(field);
			validators.add(mapping.validator);
		});

		// Add IsObject for Json fields
		if (fields.some((field) => field.type === 'Json')) {
			validators.add('IsObject');
		}

		if (validators.size > 0) {
			const validatorImports = Array.from(validators).sort().join(', ');
			imports.add(`import { ${validatorImports} } from 'class-validator';`);
		}

		// Add enum imports
		const enumImports = this.typeMapper.getEnumImports();
		if (enumImports.length > 0) {
			imports.add(`import { ${enumImports.join(', ')} } from './enums';`);
		}

		return Array.from(imports).join('\n');
	}

	private generateProperty(field: FieldInfo, isReadOnly: boolean): string {
		const mapping = this.typeMapper.mapField(field);
		const decorators: string[] = [];

		// Generate Swagger decorator
		const swaggerOptions: string[] = [];
		if (mapping.isArray) {
			swaggerOptions.push(
				`type: ${mapping.enumName || `'${mapping.swaggerType}'`}`,
			);
			swaggerOptions.push('isArray: true');
		} else if (mapping.enumName) {
			swaggerOptions.push(`enum: ${mapping.enumName}`);
			swaggerOptions.push(`enumName: '${mapping.enumName}'`);
		} else {
			swaggerOptions.push(`type: '${mapping.swaggerType}'`);
			if (mapping.swaggerFormat) {
				swaggerOptions.push(`format: '${mapping.swaggerFormat}'`);
			}
			// Add additionalProperties for object types
			if (mapping.swaggerType === 'object') {
				swaggerOptions.push('additionalProperties: true');
			}
		}

		if (mapping.isNullable) {
			swaggerOptions.push('nullable: true');
		}

		if (isReadOnly || field.isId || field.isUpdatedAt) {
			swaggerOptions.push('readOnly: true');
		}

		const swaggerDecorator =
			mapping.isOptional || mapping.isNullable
				? 'ApiPropertyOptional'
				: 'ApiProperty';

		decorators.push(`@${swaggerDecorator}({ ${swaggerOptions.join(', ')} })`);

		// Generate validator decorator
		const validatorOptions = mapping.validatorOptions
			? `({ ${Object.entries(mapping.validatorOptions)
					.map(([k, v]) => `${k}: ${v}`)
					.join(', ')} })`
			: '()';
		decorators.push(`@${mapping.validator}${validatorOptions}`);

		// Generate TypeScript property
		let tsType = mapping.tsType;
		if (mapping.isArray) {
			tsType = `${tsType}[]`;
		}

		// Handle optional and nullable types
		if (mapping.isOptional && mapping.isNullable) {
			// Field can be omitted or explicitly set to null
			tsType = `${tsType} | null`;
		} else if (mapping.isOptional) {
			// Field can be omitted - don't modify the type, the ? goes after the property name
			// tsType remains as is
		} else if (mapping.isNullable) {
			// Field is required but can be null
			tsType = `${tsType} | null`;
		}

		// Handle optional property syntax
		const propertyName =
			mapping.isOptional && !mapping.isNullable ? `${field.name}?` : field.name;

		return `${decorators.join('\n  ')}\n  ${propertyName}: ${tsType};`;
	}

	private toKebabCase(str: string): string {
		return str
			.replace(/([A-Z])/g, '-$1')
			.toLowerCase()
			.replace(/^-/, '');
	}
}
