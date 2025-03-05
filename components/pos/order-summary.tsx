"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Trash2, Plus, Minus, X, Receipt, ShoppingCart, PenLine } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  additionals?: {
    _id: string;
    name: string;
    price: number;
  }[];
}

interface OrderSummaryProps {
  items: OrderItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onAddNote: (itemId: string, note: string) => void;
  onCheckout: () => void;
  onClearOrder: () => void;
}

export function OrderSummary({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onAddNote,
  onCheckout,
  onClearOrder,
}: OrderSummaryProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const subtotal = items.reduce(
    (acc, item) => {
      const itemTotal = item.price * item.quantity;
      const additionalsTotal = item.additionals?.reduce(
        (sum, additional) => sum + additional.price * item.quantity,
        0
      ) || 0;
      return acc + itemTotal + additionalsTotal;
    },
    0
  );

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSaveNote = (itemId: string) => {
    onAddNote(itemId, noteText);
    setEditingNoteId(null);
    setNoteText("");
  };

  const handleCancelNote = () => {
    setEditingNoteId(null);
    setNoteText("");
  };

  const handleEditNote = (itemId: string, currentNote?: string) => {
    setEditingNoteId(itemId);
    setNoteText(currentNote || "");
  };

  const calculateItemTotal = (item: OrderItem) => {
    const itemPrice = item.price * item.quantity;
    const additionalsPrice = item.additionals?.reduce(
      (sum, additional) => sum + additional.price * item.quantity,
      0
    ) || 0;
    return itemPrice + additionalsPrice;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 sm:p-4 border-b bg-card sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Pedido Atual</h2>
            {totalItems > 0 && (
              <Badge variant="secondary" className="ml-1">
                {totalItems} {totalItems === 1 ? 'item' : 'itens'}
              </Badge>
            )}
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearOrder}
              className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
          <p className="text-muted-foreground">
            Nenhum item adicionado ao pedido
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Selecione produtos para adicionar ao pedido
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1">
            <div className="p-3 sm:p-4 space-y-2">
              {items.map((item) => (
                <Card key={item._id} className="p-2 border-muted hover:border-border transition-colors">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item._id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {item.additionals && item.additionals.length > 0 && (
                        <div className="mt-1.5 space-y-1">
                          {item.additionals.map((additional) => (
                            <div key={additional._id} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">+ {additional.name}</span>
                              <span className="text-muted-foreground">
                                {formatCurrency(additional.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() =>
                              onUpdateQuantity(
                                item._id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-5 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() =>
                              onUpdateQuantity(item._id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          {!item.notes && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full text-muted-foreground"
                              onClick={() => handleEditNote(item._id)}
                            >
                              <PenLine className="h-3 w-3" />
                            </Button>
                          )}
                          <span className="text-sm font-medium">
                            {formatCurrency(calculateItemTotal(item))}
                          </span>
                        </div>
                      </div>

                      {item.notes && editingNoteId !== item._id && (
                        <div className="mt-2 bg-muted/50 p-1.5 rounded-md">
                          <div className="flex justify-between items-start">
                            <p className="text-xs text-muted-foreground">
                              {item.notes}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 rounded-full text-muted-foreground"
                              onClick={() => handleEditNote(item._id, item.notes)}
                            >
                              <PenLine className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {editingNoteId === item._id && (
                        <div className="mt-2">
                          <Input
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Adicionar observação"
                            className="text-xs h-8"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleSaveNote(item._id)}
                            >
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={handleCancelNote}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <div className="p-3 sm:p-4 border-t mt-auto bg-card">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Subtotal</span>
                <span className="text-sm font-medium">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg text-primary">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <Button 
                className="w-full mt-2" 
                onClick={onCheckout}
                size="lg"
              >
                Finalizar Pedido
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 