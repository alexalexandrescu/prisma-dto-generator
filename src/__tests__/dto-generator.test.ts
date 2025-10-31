import { DTOGenerator } from '../dto-generator';
import type { EnumInfo, FieldInfo, ModelInfo } from '../types';

describe('DTOGenerator', () => {
	let generator: DTOGenerator;
	const mockEnums: EnumInfo[] = [
		{ name: 'UserRole', values: ['ADMIN', 'USER', 'GUEST'] },
	];

	const mockModel: ModelInfo = {
		name: 'User',
		fields: [
			{
				name: 'id',
				type: 'String',
				isOptional: false,
				isNullable: false,
				isArray: false,
				isUpdatedAt: false,
				hasDefault: false,
				isId: true,
				isRelation: false,
			},
			{
				name: 'name',
				type: 'String',
				isOptional: false,
				isNullable: false,
				isArray: false,
				isUpdatedAt: false,
				hasDefault: false,
				isId: false,
				isRelation: false,
			},
			{
				name: 'email',
				type: 'String',
				isOptional: true,
				isNullable: false,
				isArray: false,
				isUpdatedAt: false,
				hasDefault: false,
				isId: false,
				isRelation: false,
			},
			{
				name: 'role',
				type: 'UserRole',
				isOptional: false,
				isNullable: false,
				isArray: false,
				isUpdatedAt: false,
				hasDefault: false,
				isId: false,
				isRelation: false,
				enumName: 'UserRole',
				enumValues: ['ADMIN', 'USER', 'GUEST'],
			},
			{
				name: 'createdAt',
				type: 'DateTime',
				isOptional: false,
				isNullable: false,
				isArray: false,
				isUpdatedAt: false,
				hasDefault: false,
				isId: false,
				isRelation: false,
			},
		],
		enums: [],
	};

	beforeEach(() => {
		generator = new DTOGenerator({}, mockEnums);
	});

	describe('generateDTOs', () => {
		it('should generate Create, Update, Read DTOs and enums file with flat structure', () => {
			const files = generator.generateDTOs([mockModel]);

			expect(files).toHaveLength(5); // Create, Update, Read, enums, and barrel file

			const createFile = files.find((f) => f.fileName === 'create-user.dto.ts');
			const updateFile = files.find((f) => f.fileName === 'update-user.dto.ts');
			const readFile = files.find((f) => f.fileName === 'read-user.dto.ts');
			const enumsFile = files.find((f) => f.fileName === 'enums.ts');
			const barrelFile = files.find((f) => f.fileName === 'index.ts');

			expect(createFile).toBeDefined();
			expect(updateFile).toBeDefined();
			expect(readFile).toBeDefined();
			expect(enumsFile).toBeDefined();
			expect(barrelFile).toBeDefined();

			// Flat structure should not have folder paths
			expect(createFile?.folderPath).toBeUndefined();
			expect(updateFile?.folderPath).toBeUndefined();
			expect(readFile?.folderPath).toBeUndefined();
		});

		it('should generate domain structure when folderStructure is domain', () => {
			const domainGenerator = new DTOGenerator(
				{
					folderStructure: 'domain',
					domainMapping: { User: 'user-management/user' },
				},
				mockEnums,
			);
			const files = domainGenerator.generateDTOs([mockModel]);

			// Should generate more files due to domain structure (at least 5: Create, Update, Read, enums, barrel + domain barrels)
			expect(files.length).toBeGreaterThanOrEqual(5);

			const createFile = files.find((f) => f.fileName === 'create-user.dto.ts');
			const updateFile = files.find((f) => f.fileName === 'update-user.dto.ts');
			const readFile = files.find((f) => f.fileName === 'read-user.dto.ts');
			const enumsFile = files.find((f) => f.fileName === 'enums.ts');
			const mainBarrelFile = files.find(
				(f) => f.fileName === 'index.ts' && !f.folderPath,
			);
			const domainBarrelFile = files.find(
				(f) => f.fileName === 'index.ts' && f.folderPath === 'user-management',
			);
			const subfolderBarrelFile = files.find(
				(f) =>
					f.fileName === 'index.ts' && f.folderPath === 'user-management/user',
			);

			expect(createFile).toBeDefined();
			expect(updateFile).toBeDefined();
			expect(readFile).toBeDefined();
			expect(enumsFile).toBeDefined();
			expect(mainBarrelFile).toBeDefined();
			expect(domainBarrelFile).toBeDefined();
			expect(subfolderBarrelFile).toBeDefined();

			// Domain structure should have folder paths
			expect(createFile?.folderPath).toBe('user-management/user');
			expect(updateFile?.folderPath).toBe('user-management/user');
			expect(readFile?.folderPath).toBe('user-management/user');
		});

		it('should generate correct Create DTO content', () => {
			const files = generator.generateDTOs([mockModel]);
			const createFile = files.find((f) => f.fileName === 'create-user.dto.ts');

			expect(createFile?.content).toContain('export class CreateUserDto');
			expect(createFile?.content).toContain('name: string');
			expect(createFile?.content).toContain('email?: string'); // Optional field
			expect(createFile?.content).toContain('role: UserRole');
			expect(createFile?.content).toContain('@ApiProperty');
			expect(createFile?.content).toContain('@IsString');
			expect(createFile?.content).toContain('@IsEmail'); // Email field uses IsEmail
			expect(createFile?.content).toContain('@IsEnum');
			// Should not contain id or createdAt for Create DTO
			expect(createFile?.content).not.toContain('id:');
			expect(createFile?.content).not.toContain('createdAt:');
		});

		it('should generate correct Update DTO content', () => {
			const files = generator.generateDTOs([mockModel]);
			const updateFile = files.find((f) => f.fileName === 'update-user.dto.ts');

			expect(updateFile?.content).toContain(
				'export class UpdateUserDto extends PartialType(CreateUserDto)',
			);
			expect(updateFile?.content).toContain(
				"import { PartialType } from '@nestjs/swagger'",
			);
			expect(updateFile?.content).toContain(
				"import { CreateUserDto } from './create-user.dto'",
			);
		});

		it('should generate correct Read DTO content', () => {
			const files = generator.generateDTOs([mockModel]);
			const readFile = files.find((f) => f.fileName === 'read-user.dto.ts');

			expect(readFile?.content).toContain('export class UserDto');
			expect(readFile?.content).toContain('id: string');
			expect(readFile?.content).toContain('name: string');
			expect(readFile?.content).toContain('email?: string'); // Optional field
			expect(readFile?.content).toContain('role: UserRole');
			expect(readFile?.content).toContain('createdAt: string');
			expect(readFile?.content).toContain('readOnly: true');
		});

		it('should generate enums file with correct content', () => {
			const files = generator.generateDTOs([mockModel]);
			const enumsFile = files.find((f) => f.fileName === 'enums.ts');

			expect(enumsFile?.content).toContain('export enum UserRole');
			expect(enumsFile?.content).toContain("ADMIN = 'ADMIN'");
			expect(enumsFile?.content).toContain("USER = 'USER'");
			expect(enumsFile?.content).toContain("GUEST = 'GUEST'");
		});

		it('should generate barrel file with correct exports', () => {
			const files = generator.generateDTOs([mockModel]);
			const barrelFile = files.find((f) => f.fileName === 'index.ts');

			expect(barrelFile?.content).toContain(
				"export { CreateUserDto } from './create-user.dto'",
			);
			expect(barrelFile?.content).toContain(
				"export { UpdateUserDto } from './update-user.dto'",
			);
			expect(barrelFile?.content).toContain(
				"export { UserDto } from './read-user.dto'",
			);
			expect(barrelFile?.content).toContain("export * from './enums'");
		});

		it('should handle nullable fields correctly', () => {
			const modelWithNullable: ModelInfo = {
				name: 'Post',
				fields: [
					{
						name: 'title',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: false,
						isRelation: false,
					},
					{
						name: 'content',
						type: 'String',
						isOptional: true,
						isNullable: true,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: false,
						isRelation: false,
					},
				],
				enums: [],
			};

			const files = generator.generateDTOs([modelWithNullable]);
			const createFile = files.find((f) => f.fileName === 'create-post.dto.ts');

			expect(createFile?.content).toContain('title: string');
			expect(createFile?.content).toContain('content: string | null');
		});

		it('should handle array fields correctly', () => {
			const modelWithArray: ModelInfo = {
				name: 'Tag',
				fields: [
					{
						name: 'name',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: false,
						isRelation: false,
					},
					{
						name: 'values',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: true,
						isUpdatedAt: false,
						hasDefault: false,
						isId: false,
						isRelation: false,
					},
				],
				enums: [],
			};

			const files = generator.generateDTOs([modelWithArray]);
			const createFile = files.find((f) => f.fileName === 'create-tag.dto.ts');

			expect(createFile?.content).toContain('name: string');
			expect(createFile?.content).toContain('values: string[]');
			expect(createFile?.content).toContain('isArray: true');
		});
	});

	describe('domain structure', () => {
		it('should generate correct domain barrel file content', () => {
			const domainGenerator = new DTOGenerator(
				{
					folderStructure: 'domain',
					domainMapping: { User: 'user-management/user' },
				},
				mockEnums,
			);
			const files = domainGenerator.generateDTOs([mockModel]);

			const domainBarrelFile = files.find(
				(f) => f.fileName === 'index.ts' && f.folderPath === 'user-management',
			);
			const subfolderBarrelFile = files.find(
				(f) =>
					f.fileName === 'index.ts' && f.folderPath === 'user-management/user',
			);

			expect(domainBarrelFile?.content).toContain("export * from './user'");
			expect(subfolderBarrelFile?.content).toContain(
				"export { CreateUserDto } from './create-user.dto'",
			);
			expect(subfolderBarrelFile?.content).toContain(
				"export { UpdateUserDto } from './update-user.dto'",
			);
			expect(subfolderBarrelFile?.content).toContain(
				"export { UserDto } from './read-user.dto'",
			);
		});

		it('should generate correct main barrel file content for domain structure', () => {
			const domainGenerator = new DTOGenerator(
				{
					folderStructure: 'domain',
					domainMapping: { User: 'user-management/user' },
				},
				mockEnums,
			);
			const files = domainGenerator.generateDTOs([mockModel]);

			const mainBarrelFile = files.find(
				(f) => f.fileName === 'index.ts' && !f.folderPath,
			);

			expect(mainBarrelFile?.content).toContain(
				"export * from './user-management'",
			);
			expect(mainBarrelFile?.content).toContain("export * from './enums'");
		});

		it('should handle multiple models in different domains', () => {
			const mediaModel: ModelInfo = {
				name: 'MediaAsset',
				fields: [
					{
						name: 'id',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: true,
						isRelation: false,
					},
					{
						name: 'name',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: false,
						isRelation: false,
					},
				],
				enums: [],
			};

			const domainGenerator = new DTOGenerator(
				{
					folderStructure: 'domain',
					domainMapping: {
						User: 'user-management/user',
						MediaAsset: 'media/media-asset',
					},
				},
				mockEnums,
			);
			const files = domainGenerator.generateDTOs([mockModel, mediaModel]);

			const userCreateFile = files.find(
				(f) => f.fileName === 'create-user.dto.ts',
			);
			const mediaCreateFile = files.find(
				(f) => f.fileName === 'create-media-asset.dto.ts',
			);

			expect(userCreateFile?.folderPath).toBe('user-management/user');
			expect(mediaCreateFile?.folderPath).toBe('media/media-asset');
		});

		it('should handle custom domain mapping', () => {
			const customMapping = {
				User: 'custom-domain/custom-user',
			};
			const domainGenerator = new DTOGenerator(
				{
					folderStructure: 'domain',
					domainMapping: customMapping,
				},
				mockEnums,
			);
			const files = domainGenerator.generateDTOs([mockModel]);

			const createFile = files.find((f) => f.fileName === 'create-user.dto.ts');
			expect(createFile?.folderPath).toBe('custom-domain/custom-user');
		});
	});

	describe('configuration', () => {
		it('should respect omitFields configuration', () => {
			const config = {
				omitFields: {
					User: ['email'],
				},
			};
			generator = new DTOGenerator(config, mockEnums);

			const files = generator.generateDTOs([mockModel]);
			const createFile = files.find((f) => f.fileName === 'create-user.dto.ts');

			expect(createFile?.content).not.toContain('email');
			expect(createFile?.content).toContain('name: string');
		});

		it('should not emit barrel file when emitBarrel is false', () => {
			const config = {
				emitBarrel: false,
			};
			generator = new DTOGenerator(config, mockEnums);

			const files = generator.generateDTOs([mockModel]);
			const barrelFile = files.find((f) => f.fileName === 'index.ts');

			expect(barrelFile).toBeUndefined();
		});

		// Note: File naming strategies are not yet implemented in the generator
		// This test is skipped until the feature is implemented
		it.skip('should handle different file naming strategies', () => {
			const kebabGenerator = new DTOGenerator(
				{ fileNaming: 'kebab' },
				mockEnums,
			);
			const camelGenerator = new DTOGenerator(
				{ fileNaming: 'camel' },
				mockEnums,
			);
			const pascalGenerator = new DTOGenerator(
				{ fileNaming: 'pascal' },
				mockEnums,
			);

			const kebabFiles = kebabGenerator.generateDTOs([mockModel]);
			const camelFiles = camelGenerator.generateDTOs([mockModel]);
			const pascalFiles = pascalGenerator.generateDTOs([mockModel]);

			expect(kebabFiles.some((f) => f.fileName === 'create-user.dto.ts')).toBe(
				true,
			);
			expect(camelFiles.some((f) => f.fileName === 'createUser.dto.ts')).toBe(
				true,
			);
			expect(pascalFiles.some((f) => f.fileName === 'CreateUser.dto.ts')).toBe(
				true,
			);
		});

		// Note: Date strategy configuration is not yet implemented in the type mapper
		// This test is skipped until the feature is implemented
		it.skip('should handle different date strategies', () => {
			const isoGenerator = new DTOGenerator(
				{ dateStrategy: 'iso-string' },
				mockEnums,
			);
			const dateGenerator = new DTOGenerator(
				{ dateStrategy: 'date' },
				mockEnums,
			);

			const modelWithDate: ModelInfo = {
				name: 'Post',
				fields: [
					{
						name: 'id',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: true,
						isRelation: false,
					},
					{
						name: 'title',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: false,
						isRelation: false,
					},
					{
						name: 'createdAt',
						type: 'DateTime',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: false,
						isRelation: false,
					},
				],
				enums: [],
			};

			const isoFiles = isoGenerator.generateDTOs([modelWithDate]);
			const dateFiles = dateGenerator.generateDTOs([modelWithDate]);

			const isoReadFile = isoFiles.find(
				(f) => f.fileName === 'read-post.dto.ts',
			);
			const dateReadFile = dateFiles.find(
				(f) => f.fileName === 'read-post.dto.ts',
			);

			expect(isoReadFile?.content).toContain('createdAt: string');
			expect(dateReadFile?.content).toContain('createdAt: Date');
		});

		// Note: JSON type configuration is not yet implemented in the type mapper
		// This test is skipped until the feature is implemented
		it.skip('should handle different JSON types', () => {
			const recordGenerator = new DTOGenerator(
				{ jsonType: 'Record<string, unknown>' },
				mockEnums,
			);
			const anyGenerator = new DTOGenerator({ jsonType: 'any' }, mockEnums);

			const modelWithJson: ModelInfo = {
				name: 'Config',
				fields: [
					{
						name: 'settings',
						type: 'Json',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: false,
						isRelation: false,
					},
				],
				enums: [],
			};

			const recordFiles = recordGenerator.generateDTOs([modelWithJson]);
			const anyFiles = anyGenerator.generateDTOs([modelWithJson]);

			const recordCreateFile = recordFiles.find(
				(f) => f.fileName === 'create-config.dto.ts',
			);
			const anyCreateFile = anyFiles.find(
				(f) => f.fileName === 'create-config.dto.ts',
			);

			expect(recordCreateFile?.content).toContain(
				'settings: Record<string, unknown>',
			);
			expect(anyCreateFile?.content).toContain('settings: any');
		});
	});

	describe('edge cases', () => {
		it('should return undefined folder path for flat structure', () => {
			const flatGenerator = new DTOGenerator(
				{ folderStructure: 'flat' },
				mockEnums,
			);
			const files = flatGenerator.generateDTOs([mockModel]);
			const createFile = files.find((f) => f.fileName === 'create-user.dto.ts');

			expect(createFile?.folderPath).toBeUndefined();
		});

		it('should handle empty model', () => {
			const emptyModel: ModelInfo = {
				name: 'Empty',
				fields: [],
				enums: [],
			};

			const files = generator.generateDTOs([emptyModel]);

			const createFile = files.find(
				(f) => f.fileName === 'create-empty.dto.ts',
			);
			const readFile = files.find((f) => f.fileName === 'read-empty.dto.ts');

			expect(createFile).toBeDefined();
			expect(readFile).toBeDefined();
			expect(createFile?.content).toContain('export class CreateEmptyDto');
			// Should contain class declaration but no properties
			expect(createFile?.content).toMatch(
				/export class CreateEmptyDto\s*\{[\s\n]*\}/,
			);
		});

		it('should not generate enums file when no enums', () => {
			const noEnumGenerator = new DTOGenerator({}, []);
			const modelWithoutEnum: ModelInfo = {
				name: 'User',
				fields: [
					{
						name: 'id',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: true,
						isRelation: false,
					},
					{
						name: 'name',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: false,
						isRelation: false,
					},
				],
				enums: [],
			};

			const files = noEnumGenerator.generateDTOs([modelWithoutEnum]);
			const enumsFile = files.find((f) => f.fileName === 'enums.ts');

			expect(enumsFile).toBeUndefined();
		});

		it('should handle model with only relation fields', () => {
			const relationOnlyModel: ModelInfo = {
				name: 'User',
				fields: [
					{
						name: 'id',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: true,
						isRelation: false,
					},
					{
						name: 'posts',
						type: 'Post',
						isOptional: false,
						isNullable: false,
						isArray: true,
						isUpdatedAt: false,
						hasDefault: false,
						isId: false,
						isRelation: true,
						relationName: 'PostToUser',
						relationType: 'many',
					},
				],
				enums: [],
			};

			const files = generator.generateDTOs([relationOnlyModel]);
			const createFile = files.find((f) => f.fileName === 'create-user.dto.ts');

			expect(createFile?.content).toContain('export class CreateUserDto');
			expect(createFile?.content).not.toContain('posts'); // Relations should be filtered
		});

		it('should handle model with only auto-generated fields', () => {
			const autoFieldsModel: ModelInfo = {
				name: 'User',
				fields: [
					{
						name: 'id',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: true,
						isId: true,
						isRelation: false,
					},
					{
						name: 'createdAt',
						type: 'DateTime',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: true,
						isId: false,
						isRelation: false,
					},
					{
						name: 'updatedAt',
						type: 'DateTime',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: true,
						hasDefault: false,
						isId: false,
						isRelation: false,
					},
				],
				enums: [],
			};

			const files = generator.generateDTOs([autoFieldsModel]);
			const createFile = files.find((f) => f.fileName === 'create-user.dto.ts');

			expect(createFile?.content).toContain('export class CreateUserDto');
			// Should not contain any of the auto-generated fields
			expect(createFile?.content).not.toContain('id:');
			expect(createFile?.content).not.toContain('createdAt:');
			expect(createFile?.content).not.toContain('updatedAt:');
		});

		it('should handle nullable required field', () => {
			const nullableRequiredModel: ModelInfo = {
				name: 'Post',
				fields: [
					{
						name: 'id',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: true,
						isRelation: false,
					},
					{
						name: 'content',
						type: 'String',
						isOptional: false,
						isNullable: true,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: false,
						isRelation: false,
					},
				],
				enums: [],
			};

			const files = generator.generateDTOs([nullableRequiredModel]);
			const createFile = files.find((f) => f.fileName === 'create-post.dto.ts');

			expect(createFile?.content).toContain('content: string | null');
			expect(createFile?.content).not.toContain('content?');
		});

		it('should handle Json fields with IsObject validator', () => {
			const jsonModel: ModelInfo = {
				name: 'Config',
				fields: [
					{
						name: 'id',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: true,
						isRelation: false,
					},
					{
						name: 'settings',
						type: 'Json',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: false,
						isRelation: false,
					},
				],
				enums: [],
			};

			const files = generator.generateDTOs([jsonModel]);
			const createFile = files.find(
				(f) => f.fileName === 'create-config.dto.ts',
			);

			expect(createFile?.content).toContain('IsObject');
			expect(createFile?.content).toContain('additionalProperties: true');
		});

		it('should generate correct property for optional nullable field', () => {
			const optionalNullableModel: ModelInfo = {
				name: 'Post',
				fields: [
					{
						name: 'id',
						type: 'String',
						isOptional: false,
						isNullable: false,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: true,
						isRelation: false,
					},
					{
						name: 'description',
						type: 'String',
						isOptional: true,
						isNullable: true,
						isArray: false,
						isUpdatedAt: false,
						hasDefault: false,
						isId: false,
						isRelation: false,
					},
				],
				enums: [],
			};

			const files = generator.generateDTOs([optionalNullableModel]);
			const createFile = files.find((f) => f.fileName === 'create-post.dto.ts');

			// When field is both optional and nullable, it's represented as "field: type | null" (without ?)
			// because the ? is only used when optional but not nullable
			expect(createFile?.content).toContain('description: string | null');
		});
	});
});
