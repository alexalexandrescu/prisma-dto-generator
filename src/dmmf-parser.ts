import type { DMMF } from '@prisma/generator-helper';
import type { EnumInfo, FieldInfo, ModelInfo } from './types';

export class DMMFParser {
	parse(dmmf: DMMF.Document): { models: ModelInfo[]; enums: EnumInfo[] } {
		const enums = this.parseEnums(dmmf.datamodel.enums);
		const models = dmmf.datamodel.models.map((model) =>
			this.parseModel(model, enums),
		);

		return { models, enums };
	}

	private parseEnums(prismaEnums: readonly DMMF.DatamodelEnum[]): EnumInfo[] {
		return prismaEnums.map((enumDef) => ({
			name: enumDef.name,
			values: enumDef.values.map((value) => value.name),
		}));
	}

	private parseModel(model: DMMF.Model, enums: EnumInfo[]): ModelInfo {
		const fields = model.fields.map((field) => this.parseField(field, enums));
		const modelEnums = fields
			.filter((field) => field.enumName)
			.map((field) => enums.find((e) => e.name === field.enumName))
			.filter((enumInfo): enumInfo is EnumInfo => Boolean(enumInfo));

		return {
			name: model.name,
			fields,
			enums: modelEnums,
		};
	}

	private parseField(field: DMMF.Field, enums: EnumInfo[]): FieldInfo {
		const isArray = field.isList;
		const isOptional = !field.isRequired;
		const isNullable =
			field.kind === 'scalar' && field.type !== 'Boolean' && !field.isRequired; // Only scalar non-boolean optional fields are nullable
		const hasDefault = !!field.default;
		const isId = field.isId;
		const isUpdatedAt = field.isUpdatedAt ?? false;
		const isRelation = !!field.relationName;

		// Determine base type
		let baseType = field.type;
		let enumName: string | undefined;
		let relationName: string | undefined;
		let relationType: 'one' | 'many' | undefined;

		// Handle enums
		if (field.kind === 'enum') {
			enumName = field.type;
		}

		// Handle relations
		if (field.kind === 'object') {
			relationName = field.relationName;
			relationType = isArray ? 'many' : 'one';
		}

		// Handle scalar types
		if (field.kind === 'scalar') {
			baseType = field.type;
		}

		return {
			name: field.name,
			type: baseType,
			isOptional,
			isNullable,
			isArray,
			isUpdatedAt,
			hasDefault,
			isId,
			isRelation,
			relationName,
			relationType,
			enumName,
			enumValues: enumName
				? enums.find((e) => e.name === enumName)?.values
				: undefined,
		};
	}
}
