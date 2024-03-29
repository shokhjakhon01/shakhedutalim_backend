import { BadRequestException, Injectable } from '@nestjs/common';
import { InstructorApplyDto } from './dto/instructor.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { Model } from 'mongoose';
import { Instructor, InstructorDocument } from './instructor.schema';

@Injectable()
export class InstructorService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Instructor.name)
    private instructorModel: Model<InstructorDocument>,
  ) {}
  async applyAsInstructor(dto: InstructorApplyDto) {
    const { email, firstName, lastName, socialMedia } = dto;
    let user: UserDocument;

    const existUser = await this.userModel.findOne({ email });
    user = existUser;

    if (!existUser) {
      const newUser = await this.userModel.create({
        ...dto,
        fullName: `${firstName} ${lastName}`,
      });
      user = newUser;
    }

    const data = { socialMedia, author: user._id };
    const existInstructor = await this.instructorModel.findOne({
      author: user._id,
    });
    console.log(existInstructor);

    if (existInstructor)
      throw new BadRequestException(
        'Instructor with that email already exist in our system',
      );

    const newInstructor = await this.instructorModel.create(data);

    return newInstructor;
  }
}
