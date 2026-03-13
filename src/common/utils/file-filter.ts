import { BadRequestException } from '@nestjs/common';


export const imageFileFilter = (
    req: any,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(
            new BadRequestException('Solo se permiten imágenes (jpeg, jpg, png, webp)'),
            false,
        );
    }
    callback(null, true);
};
