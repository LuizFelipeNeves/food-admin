"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { trpc } from "@/app/_trpc/client";
import { AuthLayout } from "@/app/components/auth/AuthLayout";
import { FormField } from "@/app/components/auth/FormField";
import { SubmitButton } from "@/app/components/auth/SubmitButton";

const FormularioSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Por favor, informe um email válido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FormularioData = z.infer<typeof FormularioSchema>;

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Cadastro realizado com sucesso! Verifique seu email para ativar sua conta.");
      router.push("/auth/verify-request");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar");
      setLoading(false);
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormularioData>({
    resolver: zodResolver(FormularioSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  const onSubmit = async (data: FormularioData) => {
    setLoading(true);
    try {
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
    } catch (error) {
      // Erro já tratado no onError do mutation
    }
  };

  return (
    <AuthLayout
      title="Criar uma nova conta"
      subtitle={
        <>
          Ou{" "}
          <Link href="/auth/login" className="font-medium text-emerald-600 hover:text-emerald-500">
            faça login na sua conta existente
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <FormField
          id="name"
          label="Nome completo"
          type="text"
          {...register("name")}
          error={errors.name}
          placeholder="Seu nome completo"
          autoComplete="name"
        />

        <FormField
          id="email"
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email}
          placeholder="seu@email.com"
          autoComplete="email"
        />

        <FormField
          id="phone"
          label="Telefone (opcional)"
          type="tel"
          {...register("phone")}
          error={errors.phone}
          placeholder="(11) 99999-9999"
          autoComplete="tel"
        />

        <FormField
          id="password"
          label="Senha"
          type="password"
          {...register("password")}
          error={errors.password}
          placeholder="********"
          autoComplete="new-password"
        />

        <FormField
          id="confirmPassword"
          label="Confirmar senha"
          type="password"
          {...register("confirmPassword")}
          error={errors.confirmPassword}
          placeholder="********"
          autoComplete="new-password"
        />

        <SubmitButton loading={loading}>
          Criar conta
        </SubmitButton>
      </form>
    </AuthLayout>
  );
} 