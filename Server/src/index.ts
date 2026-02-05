import 'dotenv/config' ;
import express, {Request,Response,NextFunction} from "express";
import cookieParser from 'cookie-parser';
import connectDatabase from './config/database.config';

import cors from 'cors';
import { Env } from './config/env.config';
import { asyncHandler } from './middlewares/asyncHandler.middleware';
import { HTTPSTATUS } from './config/http.config';
import { errorHandler } from './middlewares/errorHandler.middleware';

const app = express() ;

app.use(express.json()) ;
app.use(cookieParser()) ;
app.use(express.urlencoded({extended:true})) ;

app.use(
    cors({
        origin:Env.FRONTEND_ORIGIN,
        credentials:true,
    })
);

app.get(
    "/health",
    asyncHandler(async(req:Request,res:Response)=>{
    res.status(HTTPSTATUS.OK).json({
        Message:"Server is healthy",
        status:"OK",
    })
}))

app.use(errorHandler);

app.listen(Env.PORT, async()=>{
    await connectDatabase() ;
    console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
})