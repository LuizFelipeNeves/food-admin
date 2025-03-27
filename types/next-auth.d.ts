import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

type Role = "user" | "employee" | "admin";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      emailVerified?: Date;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: Role;
    emailVerified?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    emailVerified?: Date;
  }
} 