import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly brevoMailService: MailService) {}

  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    const result = await this.brevoMailService.sendOtpVerification(email);
    return result;
  }

  @Post('verify-otp')
  async verifyOtpVerification(@Body() dto: { email: string; otp: string }) {
    return this.brevoMailService.verifyOtp(dto.email, dto.otp);
  }
}
