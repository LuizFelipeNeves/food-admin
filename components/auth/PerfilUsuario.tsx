"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/app/_trpc/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { PerfilSchema, SenhaSchema } from "@/lib/validations/auth";

type PerfilData = {
  name: string;
  phone: string;
};

type SenhaData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function PerfilUsuario() {
  const [loadingPerfil, setLoadingPerfil] = useState(false);
  const [loadingSenha, setLoadingSenha] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Consulta para obter dados do perfil
  const { data: user, isLoading: isLoadingUser } = trpc.auth.getProfile.useQuery();

  // Mutations
  const { mutateAsync: updateProfileMutation } = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      setLoadingPerfil(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar perfil");
      setLoadingPerfil(false);
    },
  });

  const { mutateAsync: changePasswordMutation } = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setLoadingSenha(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao alterar senha");
      setLoadingSenha(false);
    },
  });

  // Form para atualização de perfil
  const perfilForm = useForm<PerfilData>({
    resolver: zodResolver(PerfilSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
    values: user ? {
      name: user.name,
      phone: user.phone || "",
    } : undefined,
  });

  // Form para alterar senha
  const senhaForm = useForm<SenhaData>({
    resolver: zodResolver(SenhaSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handlers
  const onSubmitPerfil = async (data: PerfilData) => {
    setLoadingPerfil(true);
    try {
      await updateProfileMutation(data);
    } catch (error) {
      // Erro já tratado no onError do mutation
    }
  };

  const onSubmitSenha = async (data: SenhaData) => {
    setLoadingSenha(true);
    try {
      await changePasswordMutation({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    } catch (error) {
      // Erro já tratado no onError do mutation
    }
  };

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-full bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="perfil" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="perfil">Informações Pessoais</TabsTrigger>
        <TabsTrigger value="senha">Alterar Senha</TabsTrigger>
      </TabsList>
      
      <TabsContent value="perfil">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...perfilForm}>
              <form onSubmit={perfilForm.handleSubmit(onSubmitPerfil)} className="space-y-4">
                <FormField
                  control={perfilForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={perfilForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite seu telefone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input value={user?.email || ""} disabled />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      O email não pode ser alterado
                    </p>
                  </FormItem>
                </div>

                <Button type="submit" className="w-full" disabled={loadingPerfil}>
                  {loadingPerfil ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="senha">
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>
              Altere sua senha de acesso ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...senhaForm}>
              <form onSubmit={senhaForm.handleSubmit(onSubmitSenha)} className="space-y-4">
                <FormField
                  control={senhaForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha atual</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha atual"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={senhaForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Digite sua nova senha"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={senhaForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar nova senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirme sua nova senha"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loadingSenha}>
                  {loadingSenha ? "Alterando..." : "Alterar Senha"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 