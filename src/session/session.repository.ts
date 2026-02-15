import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateResult } from 'mongoose';
import { ISesion, SESION_MODEL_NAME } from './session.interfaces';

@Injectable()
export class SessionRepository {
    constructor(
        @InjectModel(SESION_MODEL_NAME)
        private readonly sessionModel: Model<ISesion>,
    ) {}

    async create(session: Partial<ISesion>) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const newSession = new this.sessionModel({
            ...session,
            expiresAt,
            isActive: true,
            createdAt: new Date(),
            lastUsedAt: new Date(),
        });
        return await newSession.save();
    }

    async findById(sessionId: string) {
        return await this.sessionModel.findById(sessionId);
    }

    async findAll() {
        return await this.sessionModel.find().exec();
    }

    async deleteById(sessionId: string, userId: string) {
        return await this.sessionModel.deleteOne({ _id: sessionId, userId });
    }

    async updateById(
        sessionId: string,
        updates: Partial<ISesion>,
    ): Promise<UpdateResult> {
        return await this.sessionModel.updateOne(
            { _id: sessionId },
            { $set: updates },
        );
    }
}
