import mongoose  , {Document , Schema }from "mongoose";
import { hashValue, compareValue} from "../utils/bcrypt";

export interface UserDocument extends Document {
    name: String;
    email: String;
    password: String;
    avatar?: String | null
    createdAt: Date;
    updatedAt: Date;
}



export const UserSchema = new Schema<UserDocument>({
    name:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:true,
    },
    avatar:{
        type:String,
        default:null,
    }
},{timestamps:true ,
     toJSON: {
    transform: (doc , ret) =>{
        if(ret) {
            delete (ret as any).password ;
        }
        return ret ;
    }
}
}
)

UserSchema.pre("save" , async function(next){
   if(!this.password && this.isModified("password")){
    this.password = await hashValue(this.password) 
   }
}) ;

UserSchema.methods.comparePassword = async function(value:string){
    return await compareValue(value , this.password) ;
}

const UserModel = mongoose.model<UserDocument>("User" , UserSchema) ;

export default UserModel ;