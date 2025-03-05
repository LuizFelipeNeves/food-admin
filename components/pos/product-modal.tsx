"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";

export interface Additional {
  _id: string;
  name: string;
  price: number;
}

export interface AdditionalGroup {
  _id: string;
  name: string;
  additionals: Additional[];
  minQuantity: number;
  maxQuantity: number;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category: {
    _id: string;
    name: string;
  };
  additionals?: Additional[];
  additionalGroups?: AdditionalGroup[];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddToOrder: (product: Product, selectedAdditionals: Additional[], quantity: number, notes: string) => void;
}

export function ProductModal({
  isOpen,
  onClose,
  product,
  onAddToOrder,
}: ProductModalProps) {
  const [selectedAdditionals, setSelectedAdditionals] = useState<Additional[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [imageError, setImageError] = useState(false);

  // Resetar estado quando o modal é aberto com um novo produto
  useEffect(() => {
    if (isOpen && product) {
      resetForm();
    }
  }, [isOpen, product]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const resetForm = () => {
    setSelectedAdditionals([]);
    setQuantity(1);
    setNotes("");
    setImageError(false);
  };

  const handleAddToOrder = () => {
    if (product) {
      onAddToOrder(product, selectedAdditionals, quantity, notes);
      resetForm();
    }
  };

  const handleAdditionalToggle = (additional: Additional, groupId?: string) => {
    setSelectedAdditionals((prev) => {
      const exists = prev.some((item) => item._id === additional._id);
      
      if (exists) {
        // Remover o adicional
        return prev.filter((item) => item._id !== additional._id);
      } else {
        // Se pertence a um grupo, verificar regras de quantidade máxima
        if (groupId && product?.additionalGroups) {
          const group = product.additionalGroups.find(g => g._id === groupId);
          
          if (group) {
            // Contar quantos adicionais deste grupo já estão selecionados
            const currentGroupSelections = prev.filter(item => 
              group.additionals.some(a => a._id === item._id)
            );
            
            // Se já atingiu o máximo, remover o primeiro adicional do grupo
            if (currentGroupSelections.length >= group.maxQuantity) {
              const firstGroupAdditionalId = currentGroupSelections[0]._id;
              const withoutFirst = prev.filter(item => item._id !== firstGroupAdditionalId);
              return [...withoutFirst, additional];
            }
          }
        }
        
        // Adicionar o novo adicional
        return [...prev, additional];
      }
    });
  };

  const calculateTotal = () => {
    if (!product) return 0;
    
    const basePrice = product.price * quantity;
    const additionalsPrice = selectedAdditionals.reduce(
      (sum, additional) => sum + additional.price * quantity,
      0
    );
    
    return basePrice + additionalsPrice;
  };

  // Verificar se um grupo tem o número mínimo de seleções
  const isGroupValid = (group: AdditionalGroup) => {
    if (group.minQuantity <= 0) return true;
    
    const selectedCount = selectedAdditionals.filter(item => 
      group.additionals.some(a => a._id === item._id)
    ).length;
    
    return selectedCount >= group.minQuantity;
  };

  // Verificar se todos os grupos obrigatórios têm seleções suficientes
  const areAllGroupsValid = () => {
    if (!product?.additionalGroups) return true;
    
    return product.additionalGroups.every(group => isGroupValid(group));
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="relative h-40 bg-muted rounded-md overflow-hidden">
            {!imageError ? (
              <Image
                src={product.image || ""}
                alt={product.name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <Badge className="bg-primary/90 text-white">
                {formatCurrency(product.price)}
              </Badge>
              {product.description && (
                <p className="text-xs text-white mt-1">{product.description}</p>
              )}
            </div>
          </div>

          <ScrollArea className="max-h-[250px] pr-3 -mr-3">
            {(product.additionals && product.additionals.length > 0) && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Adicionais</h3>
                <div className="space-y-2">
                  {product.additionals.map((additional) => (
                    <div key={additional._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={additional._id}
                          checked={selectedAdditionals.some(
                            (item) => item._id === additional._id
                          )}
                          onCheckedChange={() => handleAdditionalToggle(additional)}
                        />
                        <Label htmlFor={additional._id} className="text-sm cursor-pointer">
                          {additional.name}
                        </Label>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(additional.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(product.additionalGroups && product.additionalGroups.length > 0) && (
              <div className="mt-4 space-y-4">
                {product.additionalGroups.map((group) => {
                  // Contar quantos adicionais deste grupo estão selecionados
                  const selectedCount = selectedAdditionals.filter(item => 
                    group.additionals.some(a => a._id === item._id)
                  ).length;
                  
                  const isValid = isGroupValid(group);
                  
                  return (
                    <div key={group._id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-sm">{group.name}</h3>
                        <div className="flex items-center gap-2">
                          {group.minQuantity > 0 && (
                            <Badge 
                              variant={isValid ? "outline" : "destructive"} 
                              className="text-xs"
                            >
                              {selectedCount}/{group.minQuantity} obrigatórios
                            </Badge>
                          )}
                          {group.maxQuantity > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Máx: {group.maxQuantity}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {group.additionals.map((additional) => (
                          <div key={additional._id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`${group._id}-${additional._id}`}
                                checked={selectedAdditionals.some(
                                  (item) => item._id === additional._id
                                )}
                                onCheckedChange={() => handleAdditionalToggle(additional, group._id)}
                                disabled={
                                  !selectedAdditionals.some(item => item._id === additional._id) && 
                                  selectedCount >= group.maxQuantity
                                }
                              />
                              <Label
                                htmlFor={`${group._id}-${additional._id}`}
                                className="text-sm cursor-pointer"
                              >
                                {additional.name}
                              </Label>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(additional.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              placeholder="Ex: Sem cebola, bem passado, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(calculateTotal())}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="sm:flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddToOrder}
            className="sm:flex-1"
            disabled={!areAllGroupsValid()}
          >
            Adicionar ao Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 