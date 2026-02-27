import "dotenv/config"
import UserModel from "../models/user.model"
import connectDatabase from "../config/database.config"


export const CreateSeedAI = async()=>{
    let seedAI = await UserModel.findOne({isAI: true}) ;
    if(seedAI){
        console.log("seed AI already exits");
        return seedAI ;
    }
    seedAI =await UserModel.create({
        name:"seedAI",
        isAI:true,
        avatar:
        "https://res.cloudinary.com/ddfwqifrn/image/upload/v1771863623/ai-logo_iipcs2.png",
    });
    console.log("SeedAI created:" ,seedAI._id);
    return seedAI ;
};


const AI = async () => {
    try{
        await connectDatabase();
        await CreateSeedAI();
        console.log("Seeding completed") ;
        process.exit(0) ;
    }catch(err){
        console.log("Seeding failed",err);
        process.exit(1) ;
    }
};

AI() ;