
export const STUDENT_MODEL_NAME = 'Student'
export const STUDENT_COLLECTION_NAME = 'student'

export interface IStudent {
    _id: string;
    groupId: string;
    dni: string;
    name: string;
    lastName: string;
    birthday: Date;
    email: string;
    phone: string;
    image: string;
    face_encodings: number[]
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const VALID_MIMETYPES = ['image/png', 'image/jpg', 'image/jpeg']

