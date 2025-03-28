"use client";

import { PosLayout } from "@/components/pos/pos-layout";
import { CategoryTabs, Category } from "@/components/pos/category-tabs";
import { ProductGrid } from "@/components/pos/product-grid";
import { OrderSummary, OrderItem } from "@/components/pos/order-summary";
import { PaymentModal } from "@/components/pos/payment-modal";
import { ProductModal, Product, Additional } from "@/components/pos/product-modal";
import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/app/_trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/layout";
import { useStoreId } from '@/hooks/useStoreId';

export default function PosPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const storeId = useStoreId();

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } =
    trpc.pos.getCategories.useQuery(undefined, {
      onError: (error) => {
        toast.error("Erro ao carregar categorias", {
          description: error.message,
        });
      },
    });

  // Fetch all products at once
  const { data: allProducts, isLoading: isLoadingProducts } =
    trpc.pos.getAllProducts.useQuery(undefined, {
      onError: (error) => {
        toast.error("Erro ao carregar produtos", {
          description: error.message,
        });
      },
      // Manter os dados em cache por mais tempo
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    });

  // Filter products by selected category on the client side
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    
    if (!selectedCategory) return allProducts;
    
    return allProducts.filter(
      (product) => product.category._id === selectedCategory
    );
  }, [allProducts, selectedCategory]);

  // Create order mutation
  const createOrderMutation = trpc.pos.createOrder.useMutation({
    onSuccess: () => {
      toast.success("Pedido criado com sucesso!");
      setOrderItems([]);
      setIsPaymentModalOpen(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error("Erro ao criar pedido", {
        description: error.message,
      });
    },
  });

  const handleSelectCategory = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleSelectProduct = useCallback((product: Product) => {
    // Se o produto tem adicionais ou grupos de adicionais, abre o modal
    if ((product.additionals && product.additionals.length > 0) || 
        (product.additionalGroups && product.additionalGroups.length > 0)) {
      setSelectedProduct(product);
      setIsProductModalOpen(true);
    } else {
      // Caso contrário, adiciona diretamente ao pedido
      addProductToOrder(product, [], 1, "");
    }
  }, []);

  const addProductToOrder = useCallback((
    product: Product, 
    selectedAdditionals: Additional[], 
    quantity: number, 
    notes: string
  ) => {
    setOrderItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        (item) => 
          item._id === product._id && 
          JSON.stringify(item.additionals || []) === JSON.stringify(selectedAdditionals)
      );

      if (existingItemIndex !== -1 && !notes) {
        // Se o produto já existe com os mesmos adicionais e sem observações, incrementa a quantidade
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Adiciona como novo item
        return [
          ...prevItems,
          {
            _id: product._id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            notes: notes || undefined,
            additionals: selectedAdditionals,
          },
        ];
      }
    });

    toast.success(`${product.name} adicionado ao pedido`);
    setIsProductModalOpen(false);
  }, []);

  const handleUpdateQuantity = useCallback((itemId: string, quantity: number) => {
    setOrderItems(prevItems => 
      prevItems.map((item) =>
        item._id === itemId ? { ...item, quantity } : item
      )
    );
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setOrderItems(prevItems => 
      prevItems.filter((item) => item._id !== itemId)
    );
  }, []);

  const handleAddNote = useCallback((itemId: string, note: string) => {
    setOrderItems(prevItems => 
      prevItems.map((item) =>
        item._id === itemId ? { ...item, notes: note } : item
      )
    );
  }, []);

  const handleClearOrder = useCallback(() => {
    setOrderItems([]);
    toast.info("Pedido limpo");
  }, []);

  const handleCheckout = useCallback(() => {
    if (orderItems.length === 0) {
      toast.error("Adicione itens ao pedido antes de finalizar");
      return;
    }
    setIsPaymentModalOpen(true);
  }, [orderItems.length]);

  const handleConfirmPayment = useCallback((paymentMethod: string) => {    
    createOrderMutation.mutate({
      items: orderItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        notes: item.notes,
        additionals: item.additionals?.map(a => a._id) || [],
      })),
      paymentMethod,
      storeId: storeId,
    });
  }, [createOrderMutation, orderItems, storeId]);

  // Se não houver categorias e ainda estiver carregando, mostra um indicador de carregamento
  if ((isLoadingCategories || isLoadingProducts) && (!categories || !allProducts)) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando PDV...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Converter os dados para os tipos corretos
  const typedCategories = categories as Category[] || [];
  const typedProducts = filteredProducts as Product[] || [];

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] w-full overflow-hidden">
        <div className="h-full w-full p-2 sm:p-4">
          <PosLayout
            orderSummary={
              <OrderSummary
                items={orderItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onAddNote={handleAddNote}
                onCheckout={handleCheckout}
                onClearOrder={handleClearOrder}
              />
            }
          >
            <div className="flex flex-col h-full overflow-hidden">
              <CategoryTabs
                categories={typedCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                isLoading={isLoadingCategories}
              />
              <div className="flex-1 min-h-0 overflow-hidden">
                <ProductGrid
                  products={typedProducts}
                  onSelectProduct={handleSelectProduct}
                  isLoading={isLoadingProducts && !allProducts}
                />
              </div>
            </div>
          </PosLayout>
        </div>

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={handleConfirmPayment}
          items={orderItems}
        />

        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          product={selectedProduct}
          onAddToOrder={addProductToOrder}
        />
      </div>
    </Layout>
  );
} 