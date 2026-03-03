import 'dotenv/config' ;
import express, {Request,Response,NextFunction} from "express";
import cookieParser from 'cookie-parser';
import connectDatabase from './config/database.config';
import cors from 'cors';    
import http from "http" ;
import passport from "passport" ;
import { Env } from './config/env.config';
import { asyncHandler } from './middlewares/asyncHandler.middleware';
import { HTTPSTATUS } from './config/http.config';
import { errorHandler } from './middlewares/errorHandler.middleware';
import "./config/passport.config" ; 
import routes from "./routes" ; 
import { initializeSocket } from "./lib/socket" ;
import path from 'path';

const app = express() ;
const server = http.createServer(app) ;

// socket
initializeSocket(server);

app.use(express.json({limit:"10mb"})) ;
app.use(cookieParser()) ;
app.use(express.urlencoded({extended:true})) ;

app.use(
    cors({
        origin:Env.FRONTEND_ORIGIN,
        credentials:true,
    })
);

app.use(passport.initialize());

app.get(
    "/health",
    asyncHandler(async(req:Request,res:Response)=>{
    res.status(HTTPSTATUS.OK).json({
        Message:"Server is healthy",
        status:"OK",
    })
}));

app.use('/api',routes) ;

if(Env.NODE_ENV === "production"){
    const clientPath = path.resolve(__dirname,"../../Client/dist") ;

    // serve the static side 
    app.use(express.static(clientPath)) ;

    app.get(/^(?!\/api).*/,(req:Request , res:Response)=>{
        res.sendFile(path.join(clientPath,"index.html")) ;
    });
}

app.use(errorHandler);

server.listen(Env.PORT, async()=>{
    await connectDatabase() ;
    console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
})