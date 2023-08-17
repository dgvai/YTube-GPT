import { Body, Controller, Post } from '@nestjs/common';
import { GptService } from './gpt.service';
import { ChatMessage } from './gpt.types';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('chat')
  async getChatResponse(@Body() messages: ChatMessage[]) {
    console.log({
      system_log: new Date().toISOString(),
      messages,
    });
    const response = await this.gptService.getChatResponse(messages);
    return response;
  }
}
