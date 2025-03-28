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
      
      // Invalidar queries específicas
      utils.dashboard.getStats.invalidate();
      utils.dashboard.getSalesChart.invalidate();
      utils.dashboard.getTopProducts.invalidate();
      utils.dashboard.getSystemStatus.invalidate();
      utils.dashboard.getOrdersByCategory.invalidate();
      utils.dashboard.getPaymentMethods.invalidate();
      utils.products.list.invalidate();
      utils.productCategories.list.invalidate();
      utils.additionals.list.invalidate();
      utils.additionalCategories.list.invalidate();
      utils.orders.getAll.invalidate();
      utils.analytics.getCustomerStats.invalidate();
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
        'Gerar Dados (7 dias)'
      )}
    </Button>
  );
} 