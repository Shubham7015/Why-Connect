import UserModel from "../models/user.model";

export const findIdUserService = async (id: string) => {
    return await UserModel.findById(id);
};