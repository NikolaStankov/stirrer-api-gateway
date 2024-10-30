import { Controller, All, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';

@Controller('tweets-read')
export class TweetsReadController {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  @All('*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    const { method, url, headers, body } = req;
    const baseUrl = this.configService.get<string>('TWEETS_READ_SERVICE_URL');
    const gatewaySecret = this.configService.get<string>('GATEWAY_SECRET');
    const targetUrl = `${baseUrl}${url}`;

    try {
      const response = await lastValueFrom(
        this.httpService.request({
          method,
          url: targetUrl,
          headers: {
            ...headers,
            'x-gateway-secret': gatewaySecret,
          },
          data: body,
        }),
      );

      res.status(response.status).send(response.data);
    } catch (error) {
      res
        .status(error.response?.status || 500)
        .send(error.response?.data || 'Internal Server Error');
    }
  }
}
