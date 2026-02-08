import ChatModel from "../models/chat.model" ;
import cloudinary from "../config/cloudinary.config" ;
import {BadRequestException , NotFoundException} from "../utils/app-error" ;
import MessageModel from "../models/message.model" ;

export const sendMessageService = async(
    userId: string,
    body:{
        chatId: string,
        content?: string,
        image?: string,
        replyToId?: string,
    }
) => {
    const {chatId , content , image , replyToId} = body ;
    
    const chat = await ChatModel.findOne({
        _id: chatId,
        participants: {
            $in: [userId],
        },
    });
    if(!chat) throw new BadRequestException("Chat not found or you are not authorized to view this chat") ;

    if(replyToId) {
        const replyMessage = await MessageModel.findOne({
            _id: replyToId,
            chatId,
        })
        if(!replyMessage) throw new NotFoundException("Reply message not found") ;
    }
    
    let imageUrl ;
    if(image) {
        // upload the image to cloudinary
        const  uploadRes = await cloudinary.uploader.upload(image)
        imageUrl = uploadRes.secure_url ;
    } 

    const newMessage = await MessageModel.create({
        chatId,
        content,
        image: imageUrl,
        replyTo: replyToId,
        sender: userId,
    });

    await newMessage.populate([
        {path: "sender" , select: " name avatar"},
        {
            path: "replyTo",
            select: "content image sender",
            populate: {
                path: "sender",
                select: "name avatar",
            },
        },
    ]);

    // webSocket
    return {userMessage : newMessage , chat
    } ;
}