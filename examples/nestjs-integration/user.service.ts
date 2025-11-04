import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { CreateUserDto, UpdateUserDto, ReadUserDto } from './dto'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<ReadUserDto> {
    const user = await this.prisma.user.create({
      data: createUserDto
    })
    return user
  }

  async findAll(): Promise<ReadUserDto[]> {
    return this.prisma.user.findMany()
  }

  async findOne(id: string): Promise<ReadUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<ReadUserDto> {
    await this.findOne(id) // Throws if not found

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto
    })

    return user
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id) // Throws if not found
    await this.prisma.user.delete({
      where: { id }
    })
  }
}

