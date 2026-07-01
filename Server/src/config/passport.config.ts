import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findIdUserService } from "../services/user.service";
import { Env } from "../config/env.config";
import UserModel from "../models/user.model";

// JWT Strategy (existing)
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
        return done(null, false);
      }
    },
  ),
);

// Google OAuth2 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: Env.GOOGLE_CLIENT_ID,
      clientSecret: Env.GOOGLE_CLIENT_SECRET,
      callbackURL: Env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || "Google User";
        const avatar = profile.photos?.[0]?.value || null;

        // 1. Try to find user by googleId
        let user = await UserModel.findOne({ googleId });

        if (!user && email) {
          // 2. Try to find by email (account linking)
          user = await UserModel.findOne({ email });
          if (user) {
            // Link Google account to existing user
            user.googleId = googleId;
            if (!user.avatar && avatar) {
              user.avatar = avatar;
            }
            await user.save();
          }
        }

        if (!user) {
          // 3. Create new user
          user = new UserModel({
            name,
            email,
            googleId,
            avatar,
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    },
  ),
);

export const passportAuthenticateJwt = passport.authenticate("jwt", {
  session: false,
});
