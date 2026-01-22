import React from "react";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { getDashboardStats } from "../actions/dashboard";

export default async function DashboardPage() {
  const { stats, chartData, recentActivity } = await getDashboardStats();

  return (
    <DashboardClient
      stats={stats}
      chartData={chartData}
      recentActivity={recentActivity}
    />
  );
}
