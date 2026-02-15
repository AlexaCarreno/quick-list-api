import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
    private readonly basePath = path.join(process.cwd(), 'storage');

    /**
     * Guarda un archivo en una carpeta específica
     * @param file archivo de multer
     * @param folder carpeta destino (users, teachers, etc)
     */
    async saveFile(
        file: Express.Multer.File,
        folder: string,
    ): Promise<{ path: string; url: string }> {
        if (!file) {
            throw new BadRequestException('Archivo no proporcionado');
        }

        // Validar tipos permitidos
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/jpg',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Tipo de archivo no permitido');
        }

        // Crear nombre único
        const extension = path.extname(file.originalname);
        const filename = `${randomUUID()}${extension}`;

        // Ruta final
        const folderPath = path.join(this.basePath, folder);
        const fullPath = path.join(folderPath, filename);

        // Crear carpeta si no existe
        await fs.mkdir(folderPath, { recursive: true });

        // Guardar archivo
        await fs.writeFile(fullPath, file.buffer);

        // URL pública (para frontend)
        const fileUrl = `/storage/${folder}/${filename}`;

        return {
            path: fullPath,
            url: fileUrl,
        };
    }

    /**
     * Elimina un archivo por su URL
     */
    async deleteFile(fileUrl: string): Promise<void> {
        if (!fileUrl) return;

        try {
            const relativePath = fileUrl.replace('/storage/', '');
            const fullPath = path.join(this.basePath, relativePath);
            await fs.unlink(fullPath);
        } catch (error) {
            // No romper la app si el archivo no existe
            console.warn('No se pudo eliminar el archivo:', error.message);
        }
    }

    /**
     * Reemplaza un archivo antiguo por uno nuevo
     */
    async replaceFile(
        oldFileUrl: string,
        newFile: Express.Multer.File,
        folder: string,
    ): Promise<{ url: string }> {
        if (oldFileUrl) {
            await this.deleteFile(oldFileUrl);
        }

        const saved = await this.saveFile(newFile, folder);
        return { url: saved.url };
    }
}
