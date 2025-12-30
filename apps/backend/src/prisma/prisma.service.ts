import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasourceUrl:
        process.env.DATABASE_URL ||
        'postgresql://postgres:password@localhost:5432/beyondchats',
    });
  }

  async onModuleInit() {
    // Temporarily disabled to bypass database connection issues
    // await this.$connect();
    console.log('PrismaService initialized (database connection bypassed)');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
