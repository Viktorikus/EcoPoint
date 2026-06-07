"use client"

import { Plus_Jakarta_Sans } from "next/font/google"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "700"] })

interface Props {
  data: { month: number; total: number }[]
}

export default function DashboardChart({ data }: Props) {
  const chartData = data.map((item) => ({
    month: `Bln ${item.month}`,
    weight: item.total,
  }))

  return (
    <div className={jakarta.className}>
      {chartData.length > 0 ? (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#16A34A" name="Berat (kg)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center text-gray-600 py-8">Belum ada data sampah</p>
      )}
    </div>
  )
}
