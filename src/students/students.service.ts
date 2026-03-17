import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    CreateStudentDto,
    GetStudentsQueryDto,
    UpdateStudentDto,
} from './students.dto';
import { Connection } from 'mongoose';
import { StorageService } from '../common/service/storage.service';
import { InjectConnection } from '@nestjs/mongoose';
import { StudentRepository } from './students.repository';
import { IStudent } from './students.interface';
import { FaceService } from '../face/face.service';

@Injectable()
export class StudentService {
    constructor(
        private readonly studentRepository: StudentRepository,
        private readonly storageService: StorageService,
        private readonly faceService: FaceService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    async create(dto: CreateStudentDto, file?: Express.Multer.File) {
        // Verificar duplicados antes de abrir transacción
        const existingEmail = await this.studentRepository.findByEmail(
            dto.email,
        );
        if (existingEmail) {
            throw new ConflictException(
                'Ya existe un estudiante con ese correo.',
            );
        }

        if (dto.documentNumber) {
            const existingDoc =
                await this.studentRepository.findByDocumentNumber(
                    dto.documentNumber,
                );
            if (existingDoc) {
                throw new ConflictException(
                    'Ya existe un estudiante con ese documento.',
                );
            }
        }

        const session = await this.connection.startSession();
        session.startTransaction();
        let photoUrl: string | undefined;

        try {
            if (file) {
                const { url } = await this.storageService.saveFile(
                    file,
                    'students',
                );
                photoUrl = url;
            }

            const student = await this.studentRepository.create(
                {
                    ...dto,
                    birthday: new Date(dto.birthday),
                    photo: photoUrl,
                },
                session,
            );

            await session.commitTransaction();
            return student;
        } catch (err) {
            await session.abortTransaction();
            if (photoUrl) await this.storageService.deleteFile(photoUrl);
            throw err;
        } finally {
            session.endSession();
        }
    }

    async findAll(query: GetStudentsQueryDto) {
        const { students, total } = await this.studentRepository.findAll(query);
        const { limit = 10, offset = 0 } = query;
        return {
            metadata: {
                total,
                limit,
                offset,
            },
            students,
        };
    }

    async findById(id: string) {
        const student = await this.studentRepository.findById(id);
        if (!student) throw new NotFoundException('Estudiante no encontrado.');
        return student;
    }

    async update(
        id: string,
        dto: UpdateStudentDto,
        file?: Express.Multer.File,
    ) {
        const session = await this.connection.startSession();
        session.startTransaction();
        let newPhotoUrl: string | undefined;

        try {
            const student = await this.studentRepository.findById(id);
            if (!student)
                throw new NotFoundException('Estudiante no encontrado.');

            if (dto.email && dto.email !== student.email) {
                const existing = await this.studentRepository.findByEmail(
                    dto.email,
                );
                if (existing)
                    throw new ConflictException('Ese correo ya está en uso.');
            }

            if (
                dto.documentNumber &&
                dto.documentNumber !== student.documentNumber
            ) {
                const existing =
                    await this.studentRepository.findByDocumentNumber(
                        dto.documentNumber,
                    );
                if (existing)
                    throw new ConflictException(
                        'Ese documento ya está en uso.',
                    );
            }

            const { removePhoto, birthday, ...rest } = dto;

            const updateData: Partial<IStudent> = { ...rest };

            if (birthday) {
                updateData.birthday = new Date(birthday);
            }

            if (file) {
                const { url } = await this.storageService.replaceFile(
                    student.photo ?? '',
                    file,
                    'students',
                );
                newPhotoUrl = url;
                updateData.photo = newPhotoUrl;
            } else if (removePhoto && student.photo) {
                await this.storageService.deleteFile(student.photo);
                updateData.photo = undefined;
            }

            const updated = await this.studentRepository.updateById(
                id,
                updateData,
                session,
            );
            await session.commitTransaction();
            return updated;
        } catch (err) {
            await session.abortTransaction();
            if (newPhotoUrl) await this.storageService.deleteFile(newPhotoUrl);
            throw err;
        } finally {
            session.endSession();
        }
    }

    async toggleState(id: string) {
        const student = await this.studentRepository.findById(id);
        if (!student) throw new NotFoundException('Estudiante no encontrado.');
        return this.studentRepository.updateById(id, { state: !student.state });
    }

    async registerFace(id: string, file: Express.Multer.File) {
        const student = await this.studentRepository.findById(id);
        if (!student) throw new NotFoundException('Estudiante no encontrado.');

        if (!file) throw new BadRequestException('Se requiere una foto.');

        await this.faceService.registerFace(id, file);

        return this.studentRepository.updateById(id, { hasFaceProfile: true });
    }

    async getFaceStatus(id: string) {
        const student = await this.studentRepository.findById(id);
        if (!student) throw new NotFoundException('Estudiante no encontrado.');
        return await this.faceService.getFaceStatus(id);
    }

    async deleteFaceProfile(id: string) {
        const student = await this.studentRepository.findById(id);
        if (!student) throw new NotFoundException('Estudiante no encontrado.');
        await this.faceService.deleteFaceProfile(id);
        return this.studentRepository.updateById(id, { hasFaceProfile: false });
    }
}
