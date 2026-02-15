import 'dotenv/config';
import * as joi from 'joi';

interface IEnvVars {
    APP_PORT: number;
    MONGO_DB_URI: string;
    JWT_PRIVATE_KEY: string;
    JWT_PUBLIC_KEY: string;
    JWT_REFRESH_SECRET_KEY: string;

    PYTHON_SERVICE_URL: string;
    MAILTRAP_TOKEN: string;
}

export interface IMapEnvVars {
    app_port: number;
    mongo_uri: string;
    jwt_private_key: string;
    jwt_public_key: string;
    jwt_refresh_secret_key: string;
    python_service_url: string;
    mailtrap_token: string;
}

const envSchema = joi
    .object({
        APP_PORT: joi.number().integer().required(),
        MONGO_DB_URI: joi.string().trim().required(),
        JWT_PRIVATE_KEY: joi.string().trim().required(),
        JWT_PUBLIC_KEY: joi.string().trim().required(),
        JWT_REFRESH_SECRET_KEY: joi.string().trim().required(),
        PYTHON_SERVICE_URL: joi.string().trim().required(),
        MAILTRAP_TOKEN: joi.string().trim().required(),
    })
    .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
    throw new Error('Error: [ environment ]: ' + error.message);
}

const envVars: IEnvVars = value;

export const envs: IMapEnvVars = {
    app_port: envVars.APP_PORT,
    mongo_uri: envVars.MONGO_DB_URI,
    jwt_private_key: envVars.JWT_PRIVATE_KEY,
    jwt_public_key: envVars.JWT_PUBLIC_KEY,
    jwt_refresh_secret_key: envVars.JWT_REFRESH_SECRET_KEY,
    python_service_url: envVars.PYTHON_SERVICE_URL,
    mailtrap_token: envVars.MAILTRAP_TOKEN,
};
