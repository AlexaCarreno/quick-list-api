import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { IStudent, STUDENT_MODEL_NAME } from './students.interface';
import { GetStudentsQueryDto } from './students.dto';
@Injectable()
export class StudentRepository {
    constructor(
        @InjectModel(STUDENT_MODEL_NAME)
        private readonly studentModel: Model<IStudent>,
    ) {}

    async create(data: Partial<IStudent>, session?: ClientSession) {
        const [student] = await this.studentModel.create([data], { session });
        return student;
    }

    async findById(id: string) {
        return this.studentModel.findById(id).exec();
    }

    async findByEmail(email: string) {
        return this.studentModel.findOne({ email }).exec();
    }

    async findByDocumentNumber(documentNumber: string) {
        return this.studentModel.findOne({ documentNumber }).exec();
    }

    async updateById(
        id: string,
        data: Partial<IStudent>,
        session?: ClientSession,
    ) {
        return this.studentModel
            .findByIdAndUpdate(id, { $set: data }, { new: true, session })
            .exec();
    }

    async findAll(query: GetStudentsQueryDto) {
        const {
            limit = 10,
            offset = 0,
            name,
            email,
            documentNumber,
            career,
        } = query;

        const filter: Record<string, any> = {};

        if (name) filter.name = { $regex: name, $options: 'i' };
        if (email) filter.email = { $regex: email, $options: 'i' };
        if (documentNumber)
            filter.documentNumber = { $regex: documentNumber, $options: 'i' };
        if (career) filter.career = { $regex: career, $options: 'i' };

        const [students, total] = await Promise.all([
            this.studentModel
                .find(filter)
                .skip(offset)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.studentModel.countDocuments(filter).exec(),
        ]);

        return { students, total };
    }
}
