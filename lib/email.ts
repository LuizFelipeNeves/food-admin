import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envia email de verificação
 */
export async function sendVerificationEmail(email: string, verificationUrl: string) {
  const { data, error } = await resend.emails.send({
    from: `Sistema <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Confirme seu email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Confirme seu endereço de email</h2>
        <p>Olá, obrigado por se cadastrar! Para confirmar seu email, clique no botão abaixo:</p>
        <div style="margin: 30px 0;">
          <a 
            href="${verificationUrl}" 
            style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;"
          >
            Verificar Email
          </a>
        </div>
        <p>Se você não solicitou este email, pode ignorá-lo com segurança.</p>
        <p>O link expira em 24 horas.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Erro ao enviar email de verificação:", error);
    throw new Error("Falha ao enviar email de verificação");
  }

  return data;
}

/**
 * Envia email de recuperação de senha
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const { data, error } = await resend.emails.send({
    from: `Sistema <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Recuperação de senha",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Recuperação de senha</h2>
        <p>Você solicitou a recuperação de senha. Clique no botão abaixo para criar uma nova senha:</p>
        <div style="margin: 30px 0;">
          <a 
            href="${resetUrl}" 
            style="background-color: #2196F3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;"
          >
            Redefinir Senha
          </a>
        </div>
        <p>Se você não solicitou a recuperação de senha, pode ignorar este email.</p>
        <p>O link expira em 1 hora.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Erro ao enviar email de recuperação de senha:", error);
    throw new Error("Falha ao enviar email de recuperação de senha");
  }

  return data;
}

/**
 * Envia email de boas-vindas
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const { data, error } = await resend.emails.send({
    from: `Sistema <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Bem-vindo ao Sistema",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bem-vindo(a), ${name}!</h2>
        <p>Obrigado por se juntar à nossa plataforma. Estamos felizes em tê-lo(a) conosco!</p>
        <p>Você pode começar a usar todos os recursos disponíveis agora mesmo.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Erro ao enviar email de boas-vindas:", error);
    throw new Error("Falha ao enviar email de boas-vindas");
  }

  return data;
} 