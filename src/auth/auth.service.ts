import { RegisterDto } from './dto/register-dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';



@Injectable()
export class AuthService {


  constructor(
    @InjectModel(User.name) 
    private userModel: Model<User>, 

    private jwtService: JwtService
  ) {}



  async create(CreateUserDto: CreateUserDto) {
    
    try {

    console.log(CreateUserDto)

    const { password, ...userData} = CreateUserDto;

    const newUser = new this.userModel(
      {
        ...userData,
        password: bcrypt.hashSync(password, 10)
      }
    );

    return await newUser.save();
      
    } catch (error) {
      if(error.code === 11000) {
        throw new UnauthorizedException ('Email already exists');
      }
      throw new UnauthorizedException ('Error', error);
    }

    

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

    const user = await this.userModel.findOne({ email });

    console.log("USER", user);

     
    if (!user) {
      throw new UnauthorizedException ('Correo no registrado');
    }

    if ( !bcrypt.compareSync(password, user.password) ) {
      console.log(password, user.password);
      throw new UnauthorizedException ('Contraseña incorrecta');
    }

    return {
      user,
      token: this.getJwtToken(user)
    };
  }

  getJwtToken(user) {

    console.log("USER JWT", user.id);
    console.log("USER JWT2", user._id.toString());

    let payload = { email: user.email, id: user.id };

    if(payload.id == undefined) {
      payload.id = user._id.toString();
    }

    console.log("PAYLOAD", payload);
    
    let token = this.jwtService.sign(payload);

    console.log("TOKEN A MANDAR", token);

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
