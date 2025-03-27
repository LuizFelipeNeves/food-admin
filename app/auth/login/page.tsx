"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { AuthLayout } from "@/app/components/auth/AuthLayout";
import { FormField } from "@/app/components/auth/FormField";
import { SubmitButton } from "@/app/components/auth/SubmitButton";

const LoginSchema = z.object({
  email: z.string().email("Por favor, informe um email válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginData = z.infer<typeof LoginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setLoading(true);
    try {
      console.log("Iniciando login...");
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      console.log("Resultado do login:", result);

      if (!result) {
        console.error("Resultado do login é nulo");
        toast.error("Erro ao fazer login");
        setLoading(false);
        return;
      }

      if (result.error) {
        console.error("Erro no login:", result.error);
        toast.error(result.error);
        setLoading(false);
        return;
      }

      if (result.ok) {
        console.log("Login bem-sucedido, redirecionando para:", callbackUrl);
        toast.success("Login realizado com sucesso!");
        // Aguardar um momento para garantir que a sessão foi estabelecida
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push(callbackUrl);
        router.refresh(); // Forçar atualização do router
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Ocorreu um erro ao fazer login");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Entre na sua conta"
      subtitle={
        <>
          Ou{" "}
          <Link href="/auth/register" className="font-medium text-emerald-600 hover:text-emerald-500">
            crie uma nova conta
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
          id="password"
          label="Senha"
          type="password"
          {...register("password")}
          error={errors.password}
          placeholder="********"
          autoComplete="current-password"
        />

        <div className="flex items-center justify-end">
          <Link href="/auth/forgot-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
            Esqueceu sua senha?
          </Link>
        </div>

        <SubmitButton loading={loading}>
          Entrar
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Carregando...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
} 