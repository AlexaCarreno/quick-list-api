import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    ClientSession,
    Model,
    PipelineStage,
    Schema,
    UpdateQuery,
} from 'mongoose';
import { PaginatedResult } from '../common/interfaces/common.interfaces';
import { ADMIN_MODEL_NAME, AdminWithUser, IAdmin } from './admin.interface';

@Injectable()
export class AdminRepository {
    constructor(
        @InjectModel(ADMIN_MODEL_NAME)
        private readonly adminModel: Model<IAdmin>,
    ) {}

    /* --------------------------------------------------
     * CREATE
     * -------------------------------------------------- */
    async create(
        data: Partial<IAdmin>,
        session?: ClientSession,
    ): Promise<IAdmin> {
        const existing = await this.adminModel
            .findOne({ documentNumber: data.documentNumber })
            .session(session ?? null)
            .exec();

        if (existing) {
            throw new ConflictException(
                `Admin profile with document '${data.documentNumber}' already exists.`,
            );
        }

        const admin = new this.adminModel({
            ...data,
            userId: this.toObjectId(data.userId),
        });

        return await admin.save({ session });
    }

    /* --------------------------------------------------
     * FIND BY USER ID
     * -------------------------------------------------- */
    async findByUserId(userId: string): Promise<IAdmin | null> {
        return await this.adminModel
            .findOne({ userId: this.toObjectId(userId) })
            .exec();
    }

    /* --------------------------------------------------
     * FIND BY ID
     * -------------------------------------------------- */
    async findById(id: string): Promise<IAdmin | null> {
        return await this.adminModel.findById(id).exec();
    }

    /* --------------------------------------------------
     * UPDATE BY ID
     * -------------------------------------------------- */
    async updateById(
        id: string,
        data: UpdateQuery<IAdmin>,
        session?: ClientSession,
    ): Promise<IAdmin> {
        const updated = await this.adminModel
            .findByIdAndUpdate(id, data, { new: true, session })
            .exec();

        if (!updated) {
            throw new NotFoundException(
                `Admin profile with id '${id}' not found.`,
            );
        }

        return updated;
    }

    /* --------------------------------------------------
     * UPDATE BY USER ID
     * -------------------------------------------------- */
    async updateByUserId(
        userId: string,
        data: UpdateQuery<IAdmin>,
        session?: ClientSession,
    ): Promise<IAdmin> {
        const updated = await this.adminModel
            .findOneAndUpdate({ userId: this.toObjectId(userId) }, data, {
                new: true,
                session,
            })
            .exec();

        if (!updated) {
            throw new NotFoundException(
                `Admin profile for userId '${userId}' not found.`,
            );
        }

        return updated;
    }

    /* --------------------------------------------------
     * FIND ALL WITH USER (aggregation)
     * -------------------------------------------------- */
    async findAllWithUser(query: {
        offset?: number;
        limit?: number;
        nameContains?: string;
        emailContains?: string;
        documentNumberContains?: string;
    }): Promise<PaginatedResult<AdminWithUser>> {
        const {
            offset = 0,
            limit = 10,
            nameContains,
            emailContains,
            documentNumberContains,
        } = query;

        const pipeline: PipelineStage[] = [
            {
                $lookup: {
                    from: 'user',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
        ];

        const match: Record<string, any> = {};

        if (nameContains) {
            match['user.name'] = { $regex: nameContains, $options: 'i' };
        }

        if (emailContains) {
            match['user.email'] = { $regex: emailContains, $options: 'i' };
        }

        if (documentNumberContains) {
            match['documentNumber'] = {
                $regex: documentNumberContains,
                $options: 'i',
            };
        }

        if (Object.keys(match).length > 0) {
            pipeline.push({ $match: match });
        }

        pipeline.push({ $sort: { createdAt: -1 } });

        pipeline.push({
            $project: {
                _id: 1,
                userId: '$user._id',
                name: '$user.name',
                lastName: '$user.lastName',
                email: '$user.email',
                birthday: '$user.birthday',
                photo: '$user.photo',
                state: '$user.state',
                documentNumber: 1,
                residential_address: 1,
                position: 1,
                department: 1,
                createdAt: 1,
            },
        });

        pipeline.push({
            $facet: {
                data: [{ $skip: offset }, { $limit: limit }],
                total: [{ $count: 'count' }],
            },
        });

        const result = await this.adminModel.aggregate(pipeline).exec();

        const data: AdminWithUser[] = result[0]?.data ?? [];
        const total: number = result[0]?.total[0]?.count ?? 0;

        return { data, total, offset, limit };
    }

    /* --------------------------------------------------
     * TOGGLE STATE (activar / desactivar via user)
     * Nota: state vive en IUser, no en IAdmin.
     * Este método es un helper semántico para dejar
     * claro la intención — la actualización real se
     * hace en UserRepository.updateById.
     * -------------------------------------------------- */
    async existsByUserId(userId: string): Promise<boolean> {
        const count = await this.adminModel
            .countDocuments({ userId: this.toObjectId(userId) })
            .exec();
        return count > 0;
    }

    /* --------------------------------------------------
     * DELETE (soft: solo si necesita limpiar en tests
     * o en casos muy específicos — en producción
     * preferir desactivar via state en User)
     * -------------------------------------------------- */
    async deleteById(id: string, session?: ClientSession): Promise<void> {
        const result = await this.adminModel
            .findByIdAndDelete(id)
            .session(session ?? null)
            .exec();

        if (!result) {
            throw new NotFoundException(
                `Admin profile with id '${id}' not found.`,
            );
        }
    }

    /* --------------------------------------------------
     * PRIVATE HELPERS
     * -------------------------------------------------- */
    private toObjectId(
        id?: string | Schema.Types.ObjectId,
    ): Schema.Types.ObjectId | undefined {
        if (!id) return undefined;
        return typeof id === 'string' ? new Schema.Types.ObjectId(id) : id;
    }
}
