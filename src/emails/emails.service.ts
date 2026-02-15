import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '../config/config.service';
import { MailtrapTransport } from 'mailtrap';

@Injectable()
export class EmailsService {
    private readonly transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport(
            MailtrapTransport({
                token: this.configService.get('mailtrap_token'),
                sandbox: true,
                testInboxId: 3709966,
            }),
        );
    }

    async sendMail(to: string, subject: string, html: string) {
        const info = await this.transporter
            .sendMail({
                from: {
                    address: 'hello@demomailtrap.com', // Email válido de Mailtrap
                    name: 'QuickList',
                },
                to,
                subject,
                html,
            })
            .catch((e) => console.log(e));

        return info;
    }
}
