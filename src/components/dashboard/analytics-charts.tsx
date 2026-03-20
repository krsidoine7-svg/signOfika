'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, subDays, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Submission {
  id: string
  created_at: string
  status: string
}

interface AnalyticsChartsProps {
  data: Submission[] | null
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const chartData = useMemo(() => {
    if (!data) return []

    // Générer les 30 derniers jours
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      return subDays(new Date(), 29 - i)
    })

    return last30Days.map((date) => {
      const dayData = data.filter((sub) =>
        isSameDay(new Date(sub.created_at), date)
      )

      return {
        date: format(date, 'dd MMM', { locale: fr }),
        total: dayData.length,
        completed: dayData.filter((sub) => sub.status === 'completed').length,
      }
    })
  }, [data])

  if (chartData.length === 0 || !data || data.length === 0) {
    return (
      <div className="h-48 w-full flex items-center justify-center text-sm font-medium text-indigo-300">
        Pas encore assez de données pour afficher un graphique.
      </div>
    )
  }

  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700 }} 
            dy={10}
            minTickGap={20}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700 }} 
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#312e81', color: '#fff', fontWeight: 600, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ fontSize: 12, fontWeight: 700 }}
            labelStyle={{ fontSize: 10, opacity: 0.7, marginBottom: 4 }}
          />
          <Area
            type="monotone"
            dataKey="total"
            name="Envoyés"
            stroke="#818cf8"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Complétés"
            stroke="#ec4899"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorCompleted)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
