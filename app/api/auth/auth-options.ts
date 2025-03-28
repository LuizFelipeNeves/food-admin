import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { connectDB } from "@/lib/mongodb";
import { Account } from "@/models/auth";
import { sendVerificationEmail } from "@/lib/email";
import { AuthOptions } from "next-auth";
import clientPromise from "@/lib/mongodb-client";

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as any,
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendVerificationEmail(identifier, url);
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        try {
          await connectDB();

          const user = await Account.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("Credenciais inválidas");
          }

          if (!user.isActive) {
            throw new Error("Conta desativada");
          }

          if (!user.emailVerified) {
            throw new Error("Email não verificado");
          }

          const isValid = await user.comparePassword(credentials.password);

          if (!isValid) {
            throw new Error("Credenciais inválidas");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Erro na autorização:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified || undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Permitir redirecionamentos internos
      if (url.startsWith(baseUrl)) return url;
      // Permitir redirecionamentos relativos
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Redirecionar para a raiz por padrão
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/register",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}; 