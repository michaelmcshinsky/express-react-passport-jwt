import mongoose, { type HydratedDocument, type Model } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface UserAttrs {
  email: string;
  passwordHash: string;
  name: string;
  role?: UserRole;
  refreshTokenHash?: string | null;
}

export interface UserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

export type UserDoc = HydratedDocument<UserAttrs, UserMethods>;

const userSchema = new mongoose.Schema<UserAttrs, Model<UserAttrs, object, UserMethods>>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    refreshTokenHash: { type: String, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.passwordHash;
        delete ret.refreshTokenHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User = mongoose.model<UserAttrs, Model<UserAttrs, object, UserMethods>>('User', userSchema);
