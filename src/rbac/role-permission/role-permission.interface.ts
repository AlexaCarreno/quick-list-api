import { Schema } from 'mongoose';

export const ROLE_PERMISSION_MODEL_NAME = 'RolePermission';
export const ROLE_PERMISSION_COLLECTION_NAME = 'role_permission';

export interface IRolePermission {
    _id: string;
    roleId: string | Schema.Types.ObjectId;
    permissionId: string | Schema.Types.ObjectId;
    assignedAt: Date;
}

// codigos qr para abrir sdk en mobil del alumno,  y renderizar mecanismo de reconocimiento facial, para garantizar que el alumno esta presente. envia feeback al server con los resultados del reconocimiento.
