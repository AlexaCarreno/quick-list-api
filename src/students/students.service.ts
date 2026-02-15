import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { extname, join } from 'path';
import { StorageService } from '../common/service/storage.service';
import { ConfigService } from '../config/config.service';
import { UpdateStudentDto } from './students.dto';
import { IStudent, VALID_MIMETYPES } from './students.interface';
import { StudentRepository } from './students.repository';

@Injectable()
export class StudentsService {
    constructor(
        private readonly studentRepository: StudentRepository,
        private readonly configService: ConfigService,
        private readonly storageService: StorageService,
    ) {}

    async createStudent(
        group_Id: string,
        data: Partial<IStudent>,
        file: Express.Multer.File,
    ): Promise<any> {
        if (!VALID_MIMETYPES.includes(file.mimetype)) {
            throw new BadRequestException('Invalid file format');
        }

        data.groupId = group_Id;

        const payload = {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            buffer: file.buffer.toString('base64'),
            size: file.size,
        };

        const response = await fetch(
            `${this.configService.get('python_service_url')}/face-encoding`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            },
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Python error: ${error.detail}`);
        }

        const results = await response.json();

        data.face_encodings = results.encodings;

        const student = await this.studentRepository.create(data);

        const {
            _id,
            groupId,
            dni,
            birthday,
            name,
            lastName,
            email,
            phone,
            status,
            createdAt,
            updatedAt,
        } = student;

        const filename = `${
            student._id
        }-${Date.now()}-${crypto.randomUUID()}${extname(file.originalname)}`;
        const relativePath = join('storage', filename);
        const absolutePath = join(process.cwd(), relativePath);
        try {
            await fs.mkdir(join(process.cwd(), './', 'storage'), {
                recursive: true,
            });
            await fs.writeFile(absolutePath, file.buffer);
        } catch (error) {
            console.error('Error writing file:', error);
            throw new UnprocessableEntityException('Error saving image file');
        }

        await this.studentRepository.update(_id, { image: relativePath });

        return {
            _id,
            groupId,
            dni,
            birthday,
            name,
            lastName,
            email,
            phone,
            status,
            createdAt,
            updatedAt,
            image: filename,
        };
    }

    async getAllStudents(groupId: string): Promise<IStudent[]> {
        return this.studentRepository.findAll(groupId);
    }

    async getStudentById(id: string): Promise<IStudent> {
        const student = await this.studentRepository.findById(id);
        if (!student) {
            throw new NotFoundException(`Student with ID ${id} not found`);
        }
        return student;
    }

    async updateStudent(
        groupId: string,
        studentId: string,
        body: UpdateStudentDto,
        file?: Express.Multer.File,
    ): Promise<IStudent> {
        // 1️⃣ Buscar estudiante existente
        const existing = await this.studentRepository.findOne({
            _id: studentId,
            groupId,
        });

        if (!existing) {
            throw new NotFoundException('Estudiante no encontrado');
        }

        // Validar formato de archivo si se envía
        if (file && !VALID_MIMETYPES.includes(file.mimetype)) {
            throw new BadRequestException('Invalid file format');
        }

        // Si se envía una nueva imagen, reemplazarla
        let imagePath = existing.image;

        if (file) {
            // Eliminar imagen anterior si existía
            if (existing.image) {
                try {
                    await fs.unlink(join(process.cwd(), existing.image));
                } catch (err) {
                    console.warn(
                        'No se pudo eliminar imagen anterior:',
                        err.message,
                    );
                }
            }

            // Guardar nueva imagen
            const filename = `${studentId}-${Date.now()}-${crypto.randomUUID()}${extname(
                file.originalname,
            )}`;
            const relativePath = join('storage', filename);
            const absolutePath = join(process.cwd(), relativePath);

            try {
                await fs.mkdir(join(process.cwd(), 'storage'), {
                    recursive: true,
                });
                await fs.writeFile(absolutePath, file.buffer);
                imagePath = relativePath;
            } catch (error) {
                console.error('Error writing file:', error);
                throw new UnprocessableEntityException(
                    'Error saving image file',
                );
            }
        }

        // Actualizar registro
        const updated = await this.studentRepository.update(studentId, {
            ...body,
            image: imagePath,
        });

        if (!updated) {
            throw new NotFoundException('No se pudo actualizar el estudiante');
        }

        return updated;
    }

    async deleteStudent(
        groupId: string,
        studentIds: string[],
    ): Promise<{ deleteds: number }> {
        const students = await this.studentRepository.findManyByIds(
            groupId,
            studentIds,
        );

        if (!students || students.length === 0) {
            throw new NotFoundException(
                'No se encontraron estudiantes para eliminar.',
            );
        }

        for (const student of students) {
            if (student.image) {
                try {
                    const absolutePath = join(process.cwd(), student.image);
                    await fs.unlink(absolutePath);
                } catch (error) {
                    console.error(error);
                }
            }
        }

        const deletedStudent = await this.studentRepository.deleteMany(
            groupId,
            studentIds,
        );

        return {
            deleteds: deletedStudent.deletedCount ?? 0,
        };
    }
}
