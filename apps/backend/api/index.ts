
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';

const server = express();

const createNestServer = async (expressInstance) => {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressInstance),
    );

    // Enable CORS
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    await app.init();
};

export default async function handler(req, res) {
    // Initialize server if needed
    // Note: Vercel might reuse containers, so we check if initialized
    // But NestJS init is heavy, let's keep it simple for now
    // For better performance, we should cache the app instance outside the handler
    // However, simpler pattern first

    if (!server.listeners('request').length) {
        await createNestServer(server);
    }

    server(req, res);
}
