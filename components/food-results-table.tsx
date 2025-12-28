"use client";

import { FoodItem, calculateCalories, generateId, PORTION_GRAMS } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FoodResultsTableProps {
  foods: FoodItem[];
  onUpdateFood: (id: string, updates: Partial<FoodItem>) => void;
  onRemoveFood: (id: string) => void;
  onAddFood: () => void;
}

export function FoodResultsTable({
  foods,
  onUpdateFood,
  onRemoveFood,
  onAddFood,
}: FoodResultsTableProps) {
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          {Math.round(confidence * 100)}%
        </Badge>
      );
    } else if (confidence >= 0.7) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          {Math.round(confidence * 100)}%
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          {Math.round(confidence * 100)}%
        </Badge>
      );
    }
  };

  if (foods.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-emerald-600/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            Detected Foods
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddFood}
            className="border-emerald-600/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Food Item</TableHead>
                <TableHead className="font-semibold text-center w-24">Confidence</TableHead>
                <TableHead className="font-semibold text-center w-28">Grams</TableHead>
                <TableHead className="font-semibold text-center w-32">Cal/100g</TableHead>
                <TableHead className="font-semibold text-center w-28">Calories</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {foods.map((food, index) => (
                <TableRow
                  key={food.id}
                  className="transition-colors hover:bg-emerald-500/5"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <TableCell>
                    <Input
                      value={food.label}
                      onChange={(e) =>
                        onUpdateFood(food.id, { label: e.target.value })
                      }
                      className="bg-transparent border-transparent hover:border-border focus:border-emerald-500 transition-colors"
                      placeholder="Food name"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {getConfidenceBadge(food.confidence)}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={food.grams}
                      onChange={(e) =>
                        onUpdateFood(food.id, {
                          grams: Math.max(0, parseInt(e.target.value) || 0),
                        })
                      }
                      className="w-20 text-center bg-transparent border-transparent hover:border-border focus:border-emerald-500 transition-colors mx-auto"
                      min={0}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={food.calories_per_100g}
                      onChange={(e) =>
                        onUpdateFood(food.id, {
                          calories_per_100g: Math.max(
                            0,
                            parseInt(e.target.value) || 0
                          ),
                        })
                      }
                      className="w-24 text-center bg-transparent border-transparent hover:border-border focus:border-emerald-500 transition-colors mx-auto"
                      min={0}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold text-emerald-400">
                      {calculateCalories(food)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveFood(food.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

