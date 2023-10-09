import { RegisterDto } from './dto/register-dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';



@Injectable()
export class AuthService {


  constructor(
    @InjectModel(User.name) 
    private userModel: Model<User>, 

    private jwtService: JwtService
  ) {}



  async create(CreateUserDto: CreateUserDto) {
    console.log(CreateUserDto)

    const newUser = new this.userModel(CreateUserDto);

    return await newUser.save();

  }


  async register(RegisterDto: RegisterDto) {
    
    let { email, nickname, password } = RegisterDto;

    let newUser = await this.create( { email, password, name:nickname } );

    return {
      user: newUser,
      token: this.getJwtToken(newUser)
    };

    
  }


  async login(LoginDto: LoginDto) {

    let { email, password } = LoginDto;

    let user = await this.userModel.findOne({ email });



    log("USER ------------------------------", user.id); 

    if (!user) {
      throw new UnauthorizedException ('Correo no registrado');
    }

    if (user.password !== password) {
      throw new UnauthorizedException ('Contraseña incorrecta');
    }

    return {
      user,
      token: this.getJwtToken(user)
    };
  }

  getJwtToken(user) {

    log("USER JWT", user.id);
    log("USER JWT2", user._id.toString());

    let payload = { email: user.email, id: user.id };

    if(payload.id == undefined) {
      payload.id = user._id.toString();
    }

    log("PAYLOAD", payload);


    
    let token = this.jwtService.sign(payload);

    log("TOKEN A MANDAR", token);

    return token;

  }


  
  findAll() {
    return this.userModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }


  async findUserById(id: string) {

    const user = await this.userModel.findById(id);
    
    if (!user) {
      throw new UnauthorizedException ('Invalid Id');
    }

    const { password, ...result } = user.toJSON();    

    return result;

  }


  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
