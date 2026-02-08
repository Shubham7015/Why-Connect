import UserModel from "../models/user.model";

export const findIdUserService = async (id: string) => {
    return await UserModel.findById(id);
};

export const getUsersService = async (userId: string) => {
const users = await UserModel.find({_id:{$ne:userId}}).select("-password") ;
return users ;
};