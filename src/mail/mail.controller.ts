import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly brevoMailService: MailService) {}

  @HttpCode(200)
  @Post('send-otp')
  async sendOtp(@Body() dto: { email: string; isUser: boolean }) {
    return await this.brevoMailService.sendOtpVerification(
      dto.email,
      dto.isUser,
    );
  }

  @HttpCode(200)
  @Post('verify-otp')
  async verifyOtp(@Body() dto: { email: string; otp: string }) {
    return this.brevoMailService.verifyOtp(dto.email, dto.otp);
  }
}
