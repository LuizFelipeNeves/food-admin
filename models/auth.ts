import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export type Role = "user" | "employee" | "admin";

export interface IAccount {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  isActive: boolean;
  emailVerified?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  verificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["user", "employee", "admin"], 
      default: "user" 
    },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    verificationToken: { type: String },
  },
  { timestamps: true }
);

// Hash da senha antes de salvar
accountSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar senha
accountSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};


//  accountSchema.index({ email: 1 }, { unique: true });

export const Account = mongoose.models.Account || mongoose.model("Account", accountSchema); 