import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TweetsWriteModule } from './tweets-write/tweets-write.module';
import { TweetsReadModule } from './tweets-read/tweets-read.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    HttpModule,
    TweetsWriteModule,
    TweetsReadModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
