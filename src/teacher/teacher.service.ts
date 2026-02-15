import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { GetTeachersQueryDto } from './teacher.dto';
import { ITeacher } from './teacher.interface';
import { TeacherRepository } from './teacher.repository';

@Injectable()
export class TeacherService {
    constructor(private readonly teacherRepository: TeacherRepository) {}

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
}
