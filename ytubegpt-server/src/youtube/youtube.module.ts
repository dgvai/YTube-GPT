import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { YoutubeController } from './youtube.controller';

@Module({
  controllers: [YoutubeController],
  providers: [YoutubeService],
})
export class YoutubeModule {}
