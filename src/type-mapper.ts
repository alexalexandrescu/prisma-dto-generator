import type { EnumInfo, FieldInfo, FieldMapping } from './types';

export class TypeMapper {
	private enums: Map<string, EnumInfo> = new Map();

	constructor(enums: EnumInfo[] = []) {
		enums.forEach((enumInfo) => {
			this.enums.set(enumInfo.name, enumInfo);
		});
	}

	getEnums(): Map<string, EnumInfo> {
		return this.enums;
	}

	mapField(field: FieldInfo): FieldMapping {
		const baseMapping = this.getBaseTypeMapping(field);

		return {
			...baseMapping,
			isArray: field.isArray,
			validatorOptions: field.isArray ? { each: true } : undefined,
		};
	}

	private getBaseTypeMapping(field: FieldInfo): FieldMapping {
		// Handle enums
		if (field.enumName) {
			if (!this.enums.has(field.enumName)) {
				throw new Error(`Enum ${field.enumName} not found`);
			}
			const enumInfo = this.enums.get(field.enumName);
			if (!enumInfo) {
				throw new Error(`Enum ${field.enumName} not found`);
			}
			return {
				tsType: field.enumName,
				swaggerType: field.enumName,
				validator: 'IsEnum',
				enumName: field.enumName,
				enumValues: enumInfo.values,
				isOptional: field.isOptional,
				isNullable: field.isNullable,
			};
		}

		// Handle Prisma types
		switch (field.type) {
			case 'String':
				return this.mapStringField(field);
			case 'Int':
				return {
					tsType: 'number',
					swaggerType: 'integer',
					swaggerFormat: 'int32',
					validator: 'IsInt',
					isOptional: field.isOptional,
					isNullable: field.isNullable,
				};
			case 'BigInt':
				return {
					tsType: 'string',
					swaggerType: 'string',
					swaggerFormat: 'bigint',
					validator: 'IsString',
					isOptional: field.isOptional,
					isNullable: field.isNullable,
				};
			case 'Float':
				return {
					tsType: 'number',
					swaggerType: 'number',
					swaggerFormat: 'float',
					validator: 'IsNumber',
					isOptional: field.isOptional,
					isNullable: field.isNullable,
				};
			case 'Decimal':
				return {
					tsType: 'string',
					swaggerType: 'string',
					swaggerFormat: 'decimal',
					validator: 'IsString',
					isOptional: field.isOptional,
					isNullable: field.isNullable,
				};
			case 'Boolean':
				return {
					tsType: 'boolean',
					swaggerType: 'boolean',
					validator: 'IsBoolean',
					isOptional: field.isOptional,
					isNullable: field.isNullable,
				};
			case 'DateTime':
				return {
					tsType: 'string',
					swaggerType: 'string',
					swaggerFormat: 'date-time',
					validator: 'IsDateString',
					isOptional: field.isOptional,
					isNullable: field.isNullable,
				};
			case 'Json':
				return {
					tsType: 'Record<string, unknown>',
					swaggerType: 'object',
					swaggerFormat: 'object',
					validator: 'IsObject',
					isOptional: field.isOptional,
					isNullable: field.isNullable,
				};
			case 'Bytes':
				return {
					tsType: 'string',
					swaggerType: 'string',
					swaggerFormat: 'byte',
					validator: 'IsString',
					isOptional: field.isOptional,
					isNullable: field.isNullable,
				};
			default:
				// Fallback for unknown types
				return {
					tsType: 'any',
					swaggerType: 'string',
					validator: 'IsString',
					isOptional: field.isOptional,
					isNullable: field.isNullable,
				};
		}
	}

	private mapStringField(field: FieldInfo): FieldMapping {
		const baseMapping: FieldMapping = {
			tsType: 'string',
			swaggerType: 'string',
			validator: 'IsString',
			isOptional: field.isOptional,
			isNullable: field.isNullable,
		};

		// Apply heuristics for special string types
		if (field.name.toLowerCase().includes('email')) {
			baseMapping.validator = 'IsEmail';
		} else if (field.name.toLowerCase().includes('url')) {
			baseMapping.validator = 'IsUrl';
		} else if (field.name.endsWith('Id') || field.name === 'id') {
			baseMapping.validator = 'IsUUID';
		}

		return baseMapping;
	}

	getEnumImports(): string[] {
		return Array.from(this.enums.keys());
	}
}
