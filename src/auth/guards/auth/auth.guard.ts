import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {


  constructor(
    private jwtService: JwtService,
    private authService: AuthService

    ) {

  };


  async canActivate(context: ExecutionContext,): Promise<boolean> {

    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    log("AUTH TOKEN", token);

    if(!token) {
      throw new UnauthorizedException('No hay bearer Token');
    }


    try {
      
      const payload = await this.jwtService.verifyAsync(
        token, { secret: process.env.JWT_SEED }
      );
  
      // console.log({payload});

      const user = await this.authService.findUserById( payload.id );

      if ( !user ) throw new UnauthorizedException('No existe el usuario');
      console.log("EK USER 1", user.name);
      if ( !user.isActive ) throw new UnauthorizedException('No esta activo el usario');

      console.log("EK USER 2", payload.id);
      
      request['user'] = user;

      console.log("EK USER 3", user);

 
    } catch (error) {
      throw new UnauthorizedException('Token INvalido ' + error);
    }
    
    console.log({token});

    return true;
    
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }


}

