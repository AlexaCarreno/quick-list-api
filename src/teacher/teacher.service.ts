import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';
import { StorageService } from '../common/service/storage.service';
import { UserRepository } from '../user/user.repository';
import { GetTeachersQueryDto, UpdateTeacherDto } from './teacher.dto';
import { ITeacher } from './teacher.interface';
import { TeacherRepository } from './teacher.repository';

@Injectable()
export class TeacherService {
    constructor(
        private readonly teacherRepository: TeacherRepository,
        private readonly userRepository: UserRepository,
        private readonly storageService: StorageService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async createProfile(
        userId: string,
        profile: Partial<ITeacher>,
        session?: ClientSession,
    ) {
        const existingProfile =
            await this.teacherRepository.findByUserId(userId);

        if (existingProfile) {
            throw new BadRequestException(
                `Teacher profile Already exist. '${existingProfile._id}'`,
            );
        }

        const teacher = await this.teacherRepository.create(
            {
                userId,
                ...profile,
            },
            session,
        );

        return teacher;
    }

    async findAll(query: GetTeachersQueryDto) {
        const result = await this.teacherRepository.findAllWithUser(query);

        const { data, limit, offset, total } = result;

        return {
            metadata: {
                total,
                limit,
                offset,
            },
            teachers: data.map((t) => ({
                _id: t._id,
                userId: t.userId,
                name: t.name,
                lastName: t.lastName,
                email: t.email,
                birthday: t.birthday,
                photo: t.photo,
                documentNumber: t.documentNumber,
                residentialAddress: t.residentialAddress,
                professionalTitle: t.professionalTitle,
                professionalLicenseNumber: t.professionalLicenseNumber,
                state: t.state,
                createdAt: t.createdAt,
            })),
        };
    }

    async updateTeacher(
        teacherId: string,
        dto: UpdateTeacherDto,
        file?: Express.Multer.File,
    ) {
        const teacher = await this.teacherRepository.findById(teacherId);
        if (!teacher) throw new NotFoundException('Teacher not found');

        const user = await this.userRepository.findById(
            teacher.userId.toString(),
        );
        if (!user) throw new NotFoundException('User not found');

        const session = await this.connection.startSession();
        let newPhotoUrl: string | null = null;

        try {
            return await session.withTransaction(async () => {
                const userUpdate: Record<string, any> = {};

                // Foto
                if (file) {
                    const { url } = await this.storageService.replaceFile(
                        user.photo ?? '',
                        file,
                        'users',
                    );
                    newPhotoUrl = url;
                    userUpdate.photo = url;
                } else if (dto.removePhoto) {
                    // Eliminar foto actual y dejar vacío
                    if (user.photo) {
                        await this.storageService.deleteFile(user.photo);
                    }
                    userUpdate.photo = '';
                }

                // Campos del User
                if (dto.name) userUpdate.name = dto.name;
                if (dto.lastName) userUpdate.lastName = dto.lastName;
                if (dto.email) userUpdate.email = dto.email;
                if (dto.birthday) userUpdate.birthday = new Date(dto.birthday);

                if (dto.changePassword && dto.password) {
                    const bcrypt = await import('bcrypt');
                    userUpdate.password = await bcrypt.hash(dto.password, 10);
                }

                if (Object.keys(userUpdate).length > 0) {
                    await this.userRepository.updateById(
                        teacher.userId.toString(),
                        userUpdate,
                        session,
                    );
                }

                // Campos del Teacher
                const teacherUpdate: Record<string, any> = {};
                if (dto.documentNumber)
                    teacherUpdate.documentNumber = dto.documentNumber;
                if (dto.residentialAddress)
                    teacherUpdate.residentialAddress = dto.residentialAddress;
                if (dto.professionalTitle)
                    teacherUpdate.professionalTitle = dto.professionalTitle;
                if (dto.professionalLicenseNumber !== undefined)
                    teacherUpdate.professionalLicenseNumber =
                        dto.professionalLicenseNumber;

                const updated = await this.teacherRepository.updateById(
                    teacherId,
                    teacherUpdate,
                    session,
                );

                return { success: true, teacherId: updated._id };
            });
        } catch (error) {
            if (newPhotoUrl) {
                await this.storageService.deleteFile(newPhotoUrl);
            }
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async toggleState(teacherId: string) {
        const teacher = await this.teacherRepository.findById(teacherId);
        if (!teacher) throw new NotFoundException('Teacher not found');

        const user = await this.userRepository.findById(
            teacher.userId.toString(),
        );
        if (!user) throw new NotFoundException('User not found');

        await this.userRepository.updateById(teacher.userId.toString(), {
            state: !user.state,
        });

        return { success: true, state: !user.state };
    }
}
