"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Tag } from "lucide-react";
import { Product } from "./product-modal";

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  isLoading?: boolean;
}

export function ProductGrid({
  products,
  onSelectProduct,
  isLoading = false,
}: ProductGridProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [productId]: true,
    }));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 p-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card
            key={i}
            className="h-48 sm:h-44 animate-pulse bg-muted flex flex-col"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-muted-foreground">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 p-3 overflow-auto">
      {products.map((product) => (
        <Card
          key={product._id}
          className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-primary/20 h-44 sm:h-40 flex flex-col"
          onClick={() => onSelectProduct(product)}
        >
          <div className="relative h-24 sm:h-20 bg-muted">
            {!imageErrors[product._id] ? (
              <Image
                src={product.image || ""}
                alt={product.name}
                fill
                className="object-cover"
                onError={() => handleImageError(product._id)}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted">
                <span className="text-muted-foreground text-sm">Sem imagem</span>
              </div>
            )}
            <div className="absolute top-0 right-0 m-1">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm font-medium">
                {formatCurrency(product.price)}
              </Badge>
            </div>
          </div>
          <div className="p-2 flex flex-col flex-1 justify-between">
            <div>
              <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
              {product.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {product.description}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-1 justify-between items-center mt-1">
              {((product.additionals && product.additionals.length > 0) || 
                (product.additionalGroups && product.additionalGroups.length > 0)) && (
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 gap-1 text-xs">
                  <Tag className="h-3 w-3" />
                  Adicionais
                </Badge>
              )}
              <Badge variant="outline" className="bg-primary/5 gap-1 text-xs ml-auto">
                <PlusCircle className="h-3 w-3" />
                Adicionar
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 