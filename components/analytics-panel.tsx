"use client";

import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format-number";
import { memo } from "react";

interface AnalyticsPanelProps {
  calorieHistory: { time: string; calories: number }[];
  currentCalories: number;
  currentLifts: number;
  playTime: number;
}

const AnalyticsPanelBase = ({
  calorieHistory,
  currentCalories,
  currentLifts,
  playTime,
}: AnalyticsPanelProps) => {
  // Calculate rate (change per second roughly) based on last 2 points
  const currentRate =
    calorieHistory.length >= 2
      ? calorieHistory[calorieHistory.length - 1].calories -
        calorieHistory[calorieHistory.length - 2].calories
      : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Calories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(currentCalories)}
            </div>
            <p className="text-xs text-muted-foreground">Current balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              +{formatNumber(currentRate)}/s
            </div>
            <p className="text-xs text-muted-foreground">Last second gain</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lifts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(currentLifts)}
            </div>
            <p className="text-xs text-muted-foreground">Reps completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(playTime / 60)}m {Math.floor(playTime % 60)}s
            </div>
            <p className="text-xs text-muted-foreground">Time active</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Calorie Growth (Latest 20s)</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={calorieHistory}>
                <defs>
                  <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${formatNumber(value)}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                  itemStyle={{ color: "#f97316" }}
                  labelStyle={{ color: "#9ca3af" }}
                  formatter={(value: number) => [
                    formatNumber(value),
                    "Calories",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#splitColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const AnalyticsPanel = memo(AnalyticsPanelBase);
