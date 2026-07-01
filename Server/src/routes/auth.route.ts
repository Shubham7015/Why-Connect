import { Router } from "express";
import passport from "passport";
import {
  registerController,
  loginController,
  logoutController,
  authStatusController,
  googleCallbackController,
} from "../controllers/auth.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const authRoutes = Router()
  .post("/register", registerController)
  .post("/login", loginController)
  .post("/logout", logoutController)
  .get("/status", passportAuthenticateJwt, authStatusController)

  // Google OAuth2 routes
  .get(
    "/google",
    passport.authenticate("google", {
      session: false,
      scope: ["profile", "email"],
    }),
  )
  .get(
    "/google/callback",
    passport.authenticate("google", {
      session: false,
      failureRedirect: "/",
    }),
    googleCallbackController,
  );

export default authRoutes;
