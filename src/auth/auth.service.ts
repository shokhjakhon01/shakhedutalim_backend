import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { AuthDto, LoginDto } from './dto/auth.dto';
import { genSalt, hash, compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from './dto/token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(body: AuthDto) {
    const existUser = await this.isExistUser(body.email);
    if (existUser) throw new BadRequestException('User already is exist');

    const salt = await genSalt(10);
    const passwordHash = await hash(body.password, salt);

    const newUser = new this.userModel({ ...body, password: passwordHash });

    const token = await this.issueTokenPair(String(newUser._id));
    return { user: this.getUserField(await newUser.save()), ...token };
  }

  async login(body: LoginDto) {
    const existUser = await this.isExistUser(body.email);
    if (!existUser) throw new BadRequestException('User not found');
    const currentPassword = await compare(body.password, existUser.password);
    if (!currentPassword)
      throw new BadRequestException('password is incorrect');

    const token = await this.issueTokenPair(String(existUser._id));

    return { user: this.getUserField(existUser), ...token };
  }

  async getNewToken({ refreshToken }: TokenDto) {
    if (!refreshToken) throw new UnauthorizedException('Please sign in ');

    const result = await this.jwtService.verifyAsync(refreshToken);

    if (!result) throw new UnauthorizedException('Invalid token or expired');
    const user = await this.userModel.findById(result._id);

    const token = await this.issueTokenPair(String(user._id));
    return { user: this.getUserField(user), ...token };
  }

  async isExistUser(email: string): Promise<UserDocument> {
    const existUser = await this.userModel.findOne({ email });

    return existUser;
  }

  async issueTokenPair(userId: string) {
    const data = { _id: userId };
    const refreshToken = await this.jwtService.signAsync(data, {
      expiresIn: '15d',
    });
    const accessToken = await this.jwtService.signAsync(data, {
      expiresIn: '1h',
    });
    return { refreshToken, accessToken };
  }

  getUserField(user: UserDocument) {
    return {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
    };
  }
}
