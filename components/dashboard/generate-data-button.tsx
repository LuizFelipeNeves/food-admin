import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/app/_trpc/client';
import { toast } from 'sonner';

export function GenerateDataButton({ storeId }: { storeId: string }) {
  const utils = trpc.useUtils();
  const seedMutation = trpc.data.seed.useMutation({
    onSuccess: (data) => {
      toast.success('Dados gerados com sucesso!', {
        description: `${data.orders} pedidos, ${data.items} produtos e ${data.categories} categorias`
      });
      // Invalida todas as queries para recarregar  os dados
      utils.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao gerar dados: ' + error.message);
    }
  });

  return (
    <Button
      variant="outline"
      onClick={() => seedMutation.mutate({ storeId, days: 7 })}
      disabled={seedMutation.isLoading}
    >
      {seedMutation.isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        'Gerar Dados'
      )}
    </Button>
  );
} 