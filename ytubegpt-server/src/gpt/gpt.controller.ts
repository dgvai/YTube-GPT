import { Body, Controller, Post } from '@nestjs/common';
import { GptService } from './gpt.service';
import { ChatMessage } from './gpt.types';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('chat')
  async getChatResponse(@Body('messages') messages: ChatMessage[]) {
    const response = await this.gptService.getChatResponse(messages);
    return response;
  }
}
