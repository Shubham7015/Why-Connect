import mongoose, {Document ,Schema} from "mongoose";

export interface ChatDocument extends Document {
    participants: mongoose.Types.ObjectId[];
    lastMessage: mongoose.Types.ObjectId;
    isGroup: boolean;
    groupName: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    
    
}

const ChatSchema = new Schema<ChatDocument>({
    participants:[
       {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
       },
    ],
    isGroup: {
        type: Boolean,
        default: false,
    },
    groupName: {
        type: String,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true,
    },
    lastMessage: {
        type:Schema.Types.ObjectId,
        ref: "Message",
        default:null,
    },
    
}, {timestamps:true});

const ChatModel = mongoose.model<ChatDocument>("Chat", ChatSchema);

export default ChatModel;