import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from '@getbrevo/brevo';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument } from './otp.schema';
import { User, UserDocument } from 'src/user/user.schema';
import { compare, genSalt, hash } from 'bcryptjs';

@Injectable()
export class MailService {
  private readonly apiInstance: TransactionalEmailsApi;
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.apiInstance = new TransactionalEmailsApi();

    this.apiInstance.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      this.configService.get<string>('EMAIL_KEY'),
    );
  }

  async sendOtpVerification(email: string) {
    if (!email) throw new ForbiddenException('Email is required');

    const otp = Math.floor(100000 + Math.random() * 900000);
    const salt = await genSalt(10);
    const hashedOtp = await hash(String(otp), salt);
    const emailData = {
      to: [{ email: email, name: 'sssss' }],
      sender: {
        name: 'Shohjahon Suyunov',
        email: 'suyunovshohjahon08@gmail.com',
      },
      subject: 'Verification email',
      htmlContent: `<h1>Verification code: ${otp}</h1>`,
      textContent: 'For relaxing free courses',
    };

    await this.otpModel.create({
      email,
      otp: hashedOtp,
      expiredAt: Date.now() + 3600000,
    });
    await this.apiInstance.sendTransacEmail(emailData);
    return 'Success';
  }
  async verifyOtp(email: string, otpVerification: string) {
    if (!otpVerification)
      throw new BadRequestException('Please send otp verification code');
    const userExistOtp = await this.otpModel.find({ email });

    const { expireAt, otp } = userExistOtp.slice(-1)[0];

    if (expireAt < new Date()) {
      await this.otpModel.deleteMany({ email });
      throw new BadRequestException('Expired code');
    }

    const validOtp = await compare(otpVerification, otp);

    if (!validOtp)
      throw new BadRequestException('Verification code is not correct');
    await this.otpModel.deleteMany({ email });
    return 'Success';
  }
}
