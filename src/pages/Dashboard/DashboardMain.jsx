import React, { useEffect, useState } from 'react'
import { Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js'
import { getLast6MonthsRevenueAPI, getStatsCurrentMonthAPI } from '@/apis'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const DashboardMain = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState([])
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    successOrders: 0,
    cancelledOrders: 0,
    revenue: 0
  })

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const result = await getLast6MonthsRevenueAPI()

        if (result.success) {
          const apiData = result.data.map((x) => ({
            month: formatMonth(x.month),
            revenue: x.revenue
          }))

          // Tạo danh sách 6 tháng gần nhất (bao gồm tháng hiện tại)
          const now = new Date()
          const last6Months = []

          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthStr = formatMonth(`${d.getFullYear()}-${String(d.getMonth() + 1)}`)
            last6Months.push({ month: monthStr, revenue: 0 })
          }

          // Ghép API vào danh sách 6 tháng
          const merged = last6Months.map((item) => {
            const matched = apiData.find((x) => x.month === item.month)
            return {
              month: item.month,
              revenue: matched ? matched.revenue : 0
            }
          })

          setMonthlyRevenue(merged)
        }
      } catch (error) {
        console.error('Lỗi khi gọi API doanh thu:', error)
      }
    }

    fetchRevenue()
  }, [])

  // Format YYYY-MM chuẩn
  const formatMonth = (m) => {
    const [y, mo] = m.split('-')
    return `${y}-${mo.toString().padStart(2, '0')}` // "2025-2" => "2025-02"
  }

  useEffect(() => {
    const fetchCurrentMonth = async () => {
      try {
        const result = await getStatsCurrentMonthAPI()

        if (result.success) {
          setOrderStats(result.data)
        }
      } catch (error) {
        console.error('Lỗi khi gọi API doanh thu:', error)
      }
    }

    fetchCurrentMonth()
  }, [])

  const barChartData = {
    labels: monthlyRevenue.map((item) => item.month),
    datasets: [
      {
        label: 'Doanh thu theo tháng',
        data: monthlyRevenue.map((item) => item.revenue),
        backgroundColor: '#3b82f6'
      }
    ]
  }

  const pieChartData = {
    labels: ['Thành công', 'Đã hủy'],
    datasets: [
      {
        data: [orderStats.successOrders, orderStats.cancelledOrders],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 1
      }
    ]
  }

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <h4 className="text-sm text-gray-500">Tổng đơn hàng tháng</h4>
          <p className="text-xl font-bold text-gray-800">{orderStats.totalOrders}</p>
        </div>
        <div className="rounded-lg bg-green-100 p-4 shadow">
          <h4 className="text-sm text-green-700">Thành công</h4>
          <p className="text-xl font-bold text-green-700">{orderStats.successOrders}</p>
        </div>
        <div className="rounded-lg bg-red-100 p-4 shadow">
          <h4 className="text-sm text-red-700">Đã hủy</h4>
          <p className="text-xl font-bold text-red-700">{orderStats.cancelledOrders}</p>
        </div>
        <div className="rounded-lg bg-blue-100 p-4 shadow">
          <h4 className="text-sm text-blue-700">Doanh thu tháng</h4>
          <p className="text-xl font-bold text-blue-700">{orderStats.revenue.toLocaleString('vi-VN')} đ</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Biểu đồ cột bên trái */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Thống kê doanh thu</h3>
          <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>

        {/* Biểu đồ tròn bên phải */}
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">Tỉ lệ trạng thái đơn hàng</h3>
          <div style={{ height: '360px' }}>
            {' '}
            {/* chỉnh kích thước tại đây */}
            <Pie
              data={pieChartData}
              options={{
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardMain
