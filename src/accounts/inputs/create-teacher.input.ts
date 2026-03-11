import { CreateTeacherDto } from '../accounts.dto';

export interface CreateTeacherInput {
    data: CreateTeacherDto;
    file?: Express.Multer.File;
}
