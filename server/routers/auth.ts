import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../trpc";
import { Account } from "@/models/auth";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";
import { signIn } from 'next-auth/react';
import { User, UserStore } from '@/models';

export const authRouter = router({
  // Registrar um novo usuário
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        email: z.string().email("Email inválido"),
        password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { name, email, password, phone } = input;

      // Verificar se o email já está em uso
      const existingUser = await Account.findOne({ email });
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email já cadastrado",
        });
      }

      // Gerar token de verificação
      const verificationToken = randomBytes(32).toString("hex");

      // Criar novo usuário
      const user = new Account({
        name,
        email,
        password,
        phone,
        verificationToken,
        role: "user", // Default role
      });

      await user.save();

      // Enviar email de verificação
      const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${verificationToken}`;
      await sendVerificationEmail(email, verificationUrl);

      return { success: true };
    }),

  // Verificar email
  verifyEmail: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { token } = input;

      const user = await Account.findOne({ verificationToken: token });
      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token inválido ou expirado",
        });
      }

      // Atualizar status de verificação
      user.emailVerified = new Date();
      user.verificationToken = undefined;
      await user.save();

      // Enviar email de boas-vindas
      await sendWelcomeEmail(user.email, user.name);

      return { success: true };
    }),

  // Solicitar recuperação de senha
  forgotPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
      })
    )
    .mutation(async ({ input }) => {
      const { email } = input;

      const user = await Account.findOne({ email });
      if (!user) {
        // Não revelar se o email existe
        return { success: true };
      }

      // Gerar token de recuperação
      const resetToken = randomBytes(32).toString("hex");
      const resetExpiration = new Date();
      resetExpiration.setHours(resetExpiration.getHours() + 1); // Expira em 1 hora

      // Salvar token
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpiration;
      await user.save();

      // Enviar email de recuperação
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(email, resetUrl);

      return { success: true };
    }),

  // Redefinir senha
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
      })
    )
    .mutation(async ({ input }) => {
      const { token, password } = input;

      const user = await Account.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token inválido ou expirado",
        });
      }

      // Atualizar senha
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return { success: true };
    }),

  // Obter perfil do usuário atual
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const user = await Account.findById(userId).select("-password");

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Usuário não encontrado",
      });
    }

    return user;
  }),

  // Atualizar perfil
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3).optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const user = await Account.findById(userId);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      // Atualizar campos
      if (input.name) user.name = input.name;
      if (input.phone) user.phone = input.phone;

      await user.save();

      return { success: true };
    }),

  // Alterar senha
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const user = await Account.findById(userId);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      // Verificar senha atual
      const isValid = await user.comparePassword(input.currentPassword);
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Senha atual incorreta",
        });
      }

      // Atualizar senha
      user.password = input.newPassword;
      await user.save();

      return { success: true };
    }),

  // Admin: Listar usuários (com paginação)
  listUsers: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        role: z.enum(["user", "employee", "admin"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, role } = input;
      const skip = (page - 1) * limit;

      const query = role ? { role } : {};
      const users = await Account.find(query)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Account.countDocuments(query);

      return {
        users,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit,
        },
      };
    }),

  // Admin: Criar funcionário ou admin
  createStaff: adminProcedure
    .input(
      z.object({
        name: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(8),
        phone: z.string().optional(),
        role: z.enum(["employee", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const { name, email, password, phone, role } = input;

      // Verificar se o email já está em uso
      const existingUser = await Account.findOne({ email });
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email já cadastrado",
        });
      }

      // Criar novo funcionário/admin
      const user = new Account({
        name,
        email,
        password,
        phone,
        role,
        emailVerified: new Date(), // Já verificado
      });

      await user.save();

      return { success: true, user: { ...user.toObject(), password: undefined } };
    }),

  // Admin: Atualizar papel do usuário
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["user", "employee", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, role } = input;

      const user = await Account.findById(userId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      user.role = role;
      await user.save();

      return { success: true };
    }),

  // Admin: Ativar/desativar usuário
  toggleUserStatus: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, isActive } = input;

      const user = await Account.findById(userId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      user.isActive = isActive;
      await user.save();

      return { success: true };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const account = await Account.findOne({ email: input.email });
        
        if (!account || !account.isActive) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Credenciais inválidas',
          });
        }

        const isValidPassword = await account.comparePassword(input.password);
        
        if (!isValidPassword) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Credenciais inválidas',
          });
        }

        const result = await signIn('credentials', {
          email: input.email,
          password: input.password,
          redirect: false,
        });

        if (result?.error) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Erro ao realizar login',
          });
        }

        return { 
          success: true,
          user: {
            id: account._id,
            name: account.name,
            email: account.email,
            role: account.role
          }
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro ao fazer login',
        });
      }
    }),

  logout: publicProcedure
    .mutation(async () => {
      return { success: true };
    }),

  getUser: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session?.user) {
        return null;
      }

      const user = await User.findById(ctx.session.user.id);
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado',
        });
      }

      return user;
    }),

  getUserStores: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session?.user) {
        return [];
      }

      const userStores = await UserStore.find({ 
        user: ctx.session.user.id,
        active: true 
      }).populate('store');

      return userStores;
    }),
}); 