import { Schema } from 'mongoose';
import { IAdmin } from './admin.interface';
import { USER_MODEL_NAME } from '../user/user.interface';

const AdminSchema = new Schema<IAdmin>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: USER_MODEL_NAME,
            required: true,
            index: true,
        },
        documentNumber: {
            type: String,
            trim: true,
            unique: true,
            required: false,
        },
        residential_address: {
            type: String,
            trim: true,
        },
        position: {
            type: String,
            trim: true,
        },
        department: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true, versionKey: false },
);

export { AdminSchema };
