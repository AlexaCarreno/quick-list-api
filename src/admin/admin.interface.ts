import { IBaseEntity } from '../common/interfaces/common.interfaces';

export interface IAdmin extends IBaseEntity {
    IDNumber: string;
    residential_address: string;
    professional_title: string;
    professional_license_number?: string;
}
