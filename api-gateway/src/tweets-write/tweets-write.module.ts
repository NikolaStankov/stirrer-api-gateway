import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TweetsWriteController } from './tweets-write.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TweetsWriteController],
})
export class TweetsWriteModule {}
