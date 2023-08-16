import { Module } from '@nestjs/common';
import { YoutubeModule } from './youtube/youtube.module';
import { ConfigModule } from '@nestjs/config';
import { GptModule } from './gpt/gpt.module';

@Module({
  imports: [ConfigModule.forRoot(), YoutubeModule, GptModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
