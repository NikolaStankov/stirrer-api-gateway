import {
  Controller,
  Get,
  UseGuards,
  All,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  @Get('public')
  public() {
    return 'This is a public route';
  }

  @Get('protected')
  @UseGuards(AuthGuard('jwt'))
  protected() {
    return 'This is a protected route';
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Admin')
  adminOnly() {
    return 'This route is for admins only';
  }

  @All('tweets-write/*')
  @UseGuards(AuthGuard('jwt'))
  async proxyTweetsWriteService(@Req() req: Request, @Res() res: Response) {
    await this.proxyRequest(req, res, 'TWEETS_WRITE_SERVICE_URL');
  }

  @All('tweets-read/*')
  @UseGuards(AuthGuard('jwt'))
  async proxyTweetsReadService(@Req() req: Request, @Res() res: Response) {
    await this.proxyRequest(req, res, 'TWEETS_READ_SERVICE_URL');
  }

  private async proxyRequest(
    req: Request,
    res: Response,
    serviceUrlKey: string,
  ) {
    const { method, headers, body } = req;
    const baseUrl = this.configService.get<string>(serviceUrlKey);

    // Extract the path after the service name
    const path = req.url.replace(/^\/[^\/]+/, '');

    const targetUrl = `${baseUrl}${path}`;

    this.logger.log(`Proxying ${method} request to ${targetUrl}`);

    try {
      const startTime = Date.now();
      const response = await lastValueFrom(
        this.httpService.request({
          method,
          url: targetUrl,
          headers: {
            ...headers,
            'x-gateway-secret':
              this.configService.get<string>('GATEWAY_SECRET'),
          },
          data: body,
          timeout: 60000, // 60 seconds timeout
        }),
      );
      const duration = Date.now() - startTime;

      this.logger.log(
        `Response received from ${targetUrl} in ${duration}ms with status ${response.status}`,
      );

      res.status(response.status).send(response.data);
    } catch (error) {
      this.logger.error(`Error proxying to ${targetUrl}: ${error.message}`);
      res
        .status(error.response?.status || 500)
        .send(error.response?.data || 'Internal Server Error');
    }
  }
}
