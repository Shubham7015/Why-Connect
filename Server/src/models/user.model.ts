import mongoose, { Document, Schema } from "mongoose";
import { hashValue, compareValue } from "../utils/bcrypt";

export interface UserDocument extends Document {
  name: string;
  email?: string;
  password?: string;
  avatar?: string | null;
  isAI: boolean;
  createdAt: Date;
  updatedAt: Date;

  comparePassword: (value: string) => Promise<boolean>;
}

export const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: function (this: UserDocument) {
        return !this.isAI;
      },
    },
    password: {
      type: String,
      required: function (this: UserDocument) {
        return !this.isAI;
      },
    },
    avatar: {
      type: String,
      default: null,
    },
    isAI: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        if (ret) {
          delete (ret as any).password;
        }
        return ret;
      },
    },
  },
);

UserSchema.pre("save", async function () {
  if (this.isModified("password") && this.password) {
    this.password = await hashValue(this.password);
  }
});

UserSchema.methods.comparePassword = async function (value: string) {
  return compareValue(value, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", UserSchema);

export default UserModel;
