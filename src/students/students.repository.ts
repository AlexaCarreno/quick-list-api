import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';
import { IStudent, STUDENT_MODEL_NAME } from './students.interface';

@Injectable()
export class StudentRepository {
    constructor(
        @InjectModel(STUDENT_MODEL_NAME)
        private readonly studentModel: Model<IStudent>,
    ) {}

    async create(studentData: Partial<IStudent>): Promise<IStudent> {
        const createdStudent = new this.studentModel(studentData);
        return createdStudent.save();
    }

    async findAll(groupId: string): Promise<IStudent[]> {
        return this.studentModel.find({ groupId }).exec();
    }

    async findById(id: string): Promise<IStudent | null> {
        return this.studentModel.findById(id).exec();
    }

    async findManyByIds(groupId: string, studentIds: string[]) {
        return await this.studentModel.find({
            groupId,
            _id: { $in: studentIds },
        });
    }

    async update(
        id: string,
        updateData: Partial<IStudent>,
    ): Promise<IStudent | null> {
        return this.studentModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
    }

    async deleteMany(
        groupId: string,
        studentIds: string[],
    ): Promise<DeleteResult> {
        return await this.studentModel
            .deleteMany({ groupId: groupId, _id: { $in: studentIds } })
            .exec();
    }

    async findOne(filters: { _id: string; groupId: string }) {
        return await this.studentModel.findOne({ ...filters });
    }
}
