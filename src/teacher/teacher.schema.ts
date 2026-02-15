import { Schema } from 'mongoose';
import { ITeacher } from './teacher.interface';
import { USER_MODEL_NAME } from '../user/user.interface';

const TeacherSchema = new Schema<ITeacher>(
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
        },
        residentialAddress: {
            type: String,
            trim: true,
        },
        professionalTitle: {
            type: String,
            trim: true,
        },
        professionalLicenseNumber: {
            type: String,
            trim: true,
            unique: true,
        },
    },
    { timestamps: true, versionKey: false },
);

export { TeacherSchema };
