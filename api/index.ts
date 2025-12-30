import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../apps/backend/src/app.module'; // Corrected path (up one level)
import express from 'express';

const server = express();

const createNestServer = async (expressInstance: any) => {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressInstance),
    );

    app.setGlobalPrefix('api/v1');

    // Enable CORS
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    await app.init();
};

export default async function handler(req: any, res: any) {
    console.log('Incoming Request URL:', req.url);
    // Initialize server if needed
    if (!server.listeners('request').length) {
        await createNestServer(server);
    }

    server(req, res);
}
