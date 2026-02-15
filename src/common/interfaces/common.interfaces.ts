// esquema base para cualquier entidad
export interface IBaseEntity {
    _id?: string;
    createdAt?: Date;
    updateAt?: Date;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    offset: number;
    limit: number;
}
