import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";

interface DeliveryStatsProps {
  averageDeliveryTime: number;
  deliveryTimeChange: number;
}

export function DeliveryStats({ averageDeliveryTime, deliveryTimeChange }: DeliveryStatsProps) {
  const isPositive = deliveryTimeChange > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const textColor = isPositive ? "text-red-500" : "text-green-500";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Tempo Médio de Entrega
        </CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">{averageDeliveryTime} min</div>
          {deliveryTimeChange !== 0 && (
            <div className={`flex items-center text-sm ${textColor}`}>
              <Icon className="h-4 w-4" />
              <span>{Math.abs(deliveryTimeChange)}%</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {isPositive 
            ? "Aumento no tempo em relação a ontem" 
            : "Redução no tempo em relação a ontem"}
        </p>
      </CardContent>
    </Card>
  );
} 