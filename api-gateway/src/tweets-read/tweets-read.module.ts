import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TweetsReadController } from './tweets-read.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TweetsReadController],
})
export class TweetsReadModule {}
