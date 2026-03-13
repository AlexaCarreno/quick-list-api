import { CreateAdminDto } from '../accounts.dto';

export interface CreateAdminInput {
    data: CreateAdminDto;
    file?: Express.Multer.File;
}
