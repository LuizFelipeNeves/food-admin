'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { toast } from 'sonner';

export function SeedButton() {
  const utils = trpc.useUtils();
  const migrationMutation = trpc.data.runMigration.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      // Invalida todas as queries para recarregar os dados
      utils.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao executar migration: ' + error.message);
    }
  });

  return (
    <Button
      variant="outline"
      onClick={() => migrationMutation.mutate()}
      disabled={migrationMutation.isLoading}
    >
      {migrationMutation.isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Atualizando...
        </>
      ) : (
        'Atualizar Dados'
      )}
    </Button>
  );
}