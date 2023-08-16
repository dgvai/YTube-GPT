import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { ChatMessage } from './gpt.types';

@Injectable()
export class GptService {
  private openai: OpenAIApi;
  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async getChatResponse(messages: ChatMessage[]) {
    return await this.openai.createChatCompletion({
      model: 'gpt-3.5-turbo-16k',
      messages,
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
  }
}
