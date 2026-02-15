import { Schema } from 'mongoose';
import { GroupStatus, IGroup } from './group.interface';

const GroupSchema = new Schema<IGroup>(
    {
        userId: {
            type: String,
            required: true,
            trim: true,
        },
        institutionName: {
            type: String,
            required: true,
            trim: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        referenceCode: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: Object.values(GroupStatus),
            required: true,
            default: GroupStatus.ACTIVE,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

GroupSchema.index({ userId: 1 });

export { GroupSchema };
