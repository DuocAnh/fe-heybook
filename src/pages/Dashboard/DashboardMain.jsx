import React, { useEffect, useState } from 'react'
import { Pie, Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from 'chart.js'
import { getLast6MonthsRevenueAPI, getStatsCurrentMonthAPI } from '@/apis'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const DashboardMain = () => {
    const [monthlyRevenue, setMonthlyRevenue] = useState([])
    const [orderStats, setOrderStats] = useState({
        totalOrders: 0,
        successOrders: 0,
        cancelledOrders: 0,
        revenue: 0,
    })

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const result = await getLast6MonthsRevenueAPI()


                if (result.success) {
                    setMonthlyRevenue(result.data)
                }
            } catch (error) {
                console.error('Lỗi khi gọi API doanh thu:', error)
            }
        }

        fetchRevenue()
    }, [])
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
        labels: monthlyRevenue.map(item => item.month),
        datasets: [
            {
                label: 'Doanh thu theo tháng',
                data: monthlyRevenue.map(item => item.revenue),
                backgroundColor: '#3b82f6',
            },
        ],
    }


    const pieChartData = {
        labels: ['Thành công', 'Đã hủy'],
        datasets: [
            {
                data: [orderStats.successOrders, orderStats.cancelledOrders],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 1,
            },
        ],
    }

    return (
        <div className="p-6 space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <h4 className="text-gray-500 text-sm">Tổng đơn hàng tháng</h4>
                    <p className="text-xl font-bold text-gray-800">{orderStats.totalOrders}</p>
                </div>
                <div className="bg-green-100 rounded-lg shadow p-4">
                    <h4 className="text-green-700 text-sm">Thành công</h4>
                    <p className="text-xl font-bold text-green-700">{orderStats.successOrders}</p>
                </div>
                <div className="bg-red-100 rounded-lg shadow p-4">
                    <h4 className="text-red-700 text-sm">Đã hủy</h4>
                    <p className="text-xl font-bold text-red-700">{orderStats.cancelledOrders}</p>
                </div>
                <div className="bg-blue-100 rounded-lg shadow p-4">
                    <h4 className="text-blue-700 text-sm">Doanh thu tháng</h4>
                    <p className="text-xl font-bold text-blue-700">
                        {orderStats.revenue.toLocaleString('vi-VN')} đ
                    </p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Biểu đồ cột bên trái */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Thống kê đơn hàng</h3>
                    <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>

                {/* Biểu đồ tròn bên phải */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Tỉ lệ trạng thái đơn hàng</h3>
                    <Pie data={pieChartData} />
                </div>
            </div>
        </div>
    )
}

export default DashboardMain
