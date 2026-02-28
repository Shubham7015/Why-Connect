import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { findIdUserService } from "../services/user.service";
import { Env } from "../config/env.config";
import { UnauthorizedException } from "../utils/app-error";

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          const token = req.cookies.accessToken;
          return token || null;
        },
      ]),
      secretOrKey: Env.JWT_SECRET,
      audience: ["user"],
      algorithms: ["HS256"],
    },
    async ({ userId }, done) => {
      try {
        const user = userId && (await findIdUserService(userId));
        return done(null, user || false);
      } catch (error) {
        throw new UnauthorizedException("unauthorized to access");
        return done(null, false);
      }
    },
  ),
);

export const passportAuthenticateJwt = passport.authenticate("jwt", {
  session: false,
});
