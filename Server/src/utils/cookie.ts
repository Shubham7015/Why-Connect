import jwt from "jsonwebtoken";
import {Response} from "express" ;
import { Env } from "../config/env.config";

type Time = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;
type Cookie = {
    res:Response,
    userId: string,
    
}
export const setJwtAuthCookie = ({res,userId}: Cookie)=>{
    const payload = {userId} ;
    const jwtExpiresIn = Env.JWT_EXPIRES_IN as Time ;
    const token = jwt.sign(payload, Env.JWT_SECRET, {
        audience: ["user"],
        expiresIn: jwtExpiresIn || "7d",
    });
    return res.cookie("accessToken" , token , {
        httpOnly:true,
        secure:Env.NODE_ENV === "production" ? true : false,
        sameSite:Env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 60 * 60 * 24 * 7 * 1000 ,
    });
};


export const clearJwtAuthCookie = (res:Response)=>{
    return res.clearCookie("accessToken", {path:"/"});
}
