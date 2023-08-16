import { Controller, Get, Param } from '@nestjs/common';
import { YoutubeService } from './youtube.service';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get('caption/:videoId')
  async getVideoCaptions(@Param('videoId') videoId: string) {
    const transcript = await this.youtubeService.getTranscript(videoId);
    const text = transcript.map((item) => item.text).join(' ');
    return text;
  }
}
