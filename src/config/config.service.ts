import { Injectable } from '@nestjs/common';
import { envs, IMapEnvVars } from './config.envs';

@Injectable()
export class ConfigService {
    private readonly configEnvs: IMapEnvVars;

    constructor() {
        this.configEnvs = envs;
    }

    public get(varName: string) {
        const varFound = this.configEnvs[varName];
        if (!varFound) {
            new Error(`envVar { ${varName} } was not found.`);
        }
        return varFound;
    }
}
