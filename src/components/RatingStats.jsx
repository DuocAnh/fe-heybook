import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getProductRatingStatsAPI } from '@/apis'

function StarDisplay({ rating, size = 'md' }) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function RatingStats({ productId }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getProductRatingStatsAPI(productId)
        setStats(response.data)
      } catch {
        // Error handled silently
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [productId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="mb-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded bg-gray-200"></div>
              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-gray-200"></div>
                <div className="h-3 w-24 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-3 w-12 rounded bg-gray-200"></div>
                  <div className="h-2 flex-1 rounded bg-gray-200"></div>
                  <div className="h-3 w-8 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="mb-2 flex items-center justify-center text-gray-400">
              <StarDisplay rating={0} size="lg" />
            </div>
            <p className="text-gray-500">Chưa có đánh giá nào</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { avgRating, totalReviews, ratingDistribution } = stats

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đánh giá sản phẩm</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Rating */}
        <div className="mb-6 flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
            <StarDisplay rating={Math.round(avgRating)} size="lg" />
          </div>
          <div className="text-sm text-gray-600">
            <div className="font-medium">{totalReviews} đánh giá</div>
            <div>Trung bình {avgRating.toFixed(1)}/5</div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating] || 0
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

            return (
              <div key={rating} className="flex items-center gap-2 text-sm">
                <div className="flex w-12 items-center gap-1">
                  <span>{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <Progress value={percentage} className="h-2 flex-1" />
                <span className="w-8 text-right text-gray-600">{count}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
