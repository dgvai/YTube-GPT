import { Injectable } from '@nestjs/common';
import { YoutubeTranscript } from 'youtube-transcript';

@Injectable()
export class YoutubeService {
  constructor() {}

  async getTranscript(videoId: string) {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript;
  }
}
