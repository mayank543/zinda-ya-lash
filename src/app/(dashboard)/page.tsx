"use client"

import { Overview } from "@/components/dashboard/overview"
import { MonitorList } from "@/components/dashboard/monitor-list"
import { ResponseTimeChart } from "@/components/dashboard/response-time-chart"

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <Overview />
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-7">
        <MonitorList />
        <div className="xl:col-span-3">
          <ResponseTimeChart />
        </div>
      </div>
    </div>
  )
}
