import mongoose, {Document ,Schema} from "mongoose";

export interface ChatDocument extends Document {
    participants: mongoose.Types.ObjectId[];
    lastMessage: mongoose.Types.ObjectId;
    isGroup: boolean;
    groupName: string ;  
    isAiChat: boolean;
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
    isAiChat: {
        type: Boolean,
        default: false,
    },
    lastMessage: {
        type:Schema.Types.ObjectId,
        ref: "Message",
        default:null,
    },
    
}, {timestamps:true});

ChatSchema.pre("save",async function(){
    if(this.isNew){
        const User = mongoose.model('User');
        const participants = await User.find({
            _id: { $in: this.participants },
            isAI: true,
        }) ;

        if(participants.length > 0){
            this.isAiChat = true;
        }
    }
   
})


const ChatModel = mongoose.model<ChatDocument>("Chat", ChatSchema);

export default ChatModel;