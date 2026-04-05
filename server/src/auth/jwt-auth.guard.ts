// jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any, info: any) {
    // Nếu lỗi throw từ JwtStrategy.validate() (token bị blacklist)
    // err sẽ là UnauthorizedException ta đã throw trong strategy
    if (err) throw err;

    if (!user) {
      //   throw new UnauthorizedException('Bạn cần đăng nhập để thực hiện thao tác này');
      const message =
        info instanceof Error
          ? info.message
          : "Bạn cần đăng nhập để thực hiện thao tác này";

      throw new UnauthorizedException(message);
    }

    return user;
  }
}
