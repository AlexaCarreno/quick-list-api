import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData = require('form-data');

@Injectable()
export class FaceService {
    private readonly faceServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.faceServiceUrl = this.configService.get('python_service_url');
    }

    async registerFace(
        studentId: string,
        file: Express.Multer.File,
    ): Promise<string> {
        const form = new FormData();
        form.append('student_id', studentId);
        form.append('photo', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });

        const { data } = await firstValueFrom(
            this.httpService.post<{ face_profile_id: string }>(
                `${this.faceServiceUrl}/faces/register`,
                form,
                { headers: form.getHeaders() },
            ),
        );

        return data.face_profile_id;
    }

    async getFaceStatus(studentId: string) {
        const { data } = await firstValueFrom(
            this.httpService.get<any>(
                `${this.faceServiceUrl}/faces/status/${studentId}`,
            ),
        );
        return data;
    }

    async deleteFaceProfile(studentId: string) {
        await firstValueFrom(
            this.httpService.delete(
                `${this.faceServiceUrl}/faces/${studentId}`,
            ),
        );
    }

    async recognizeFace(
        file: Express.Multer.File,
        studentIds: string[],
        threshold?: number,
    ) {
        const form = new FormData();
        form.append('photo', file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });
        form.append('student_ids', JSON.stringify(studentIds));
        if (threshold) form.append('threshold', String(threshold));

        const { data } = await firstValueFrom(
            this.httpService.post<any>(
                `${this.faceServiceUrl}/faces/recognize`,
                form,
                { headers: form.getHeaders() },
            ),
        );

        return data;
    }
}
