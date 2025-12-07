import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToCartAPI } from '@/apis'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuthCheck } from '@/hooks/useAuthGuard'

const AddToCartButton = ({
  product,
  variant = 'default',
  size = 'default',
  className = '',
  showQuantitySelector = false,
  quantity: externalQuantity,
  onAddToCartSuccess
}) => {
  const [quantity, setQuantity] = useState(externalQuantity || 1)
  const queryClient = useQueryClient()
  const { checkAuth } = useAuthCheck({
    message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!'
  })

  // Sync internal quantity with external quantity
  useEffect(() => {
    if (externalQuantity) {
      setQuantity(externalQuantity)
    }
  }, [externalQuantity])

  const addToCartMutation = useMutation({
    mutationFn: (data) => addToCartAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart'])
      toast.success('Đã thêm sản phẩm vào giỏ hàng!', { theme: 'colored' })
      if (showQuantitySelector) {
        setQuantity(1)
      }
      if (onAddToCartSuccess) {
        onAddToCartSuccess()
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng!')
    }
  })

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (!product) return

    // Kiểm tra đăng nhập và thực hiện thêm vào giỏ hàng
    checkAuth(() => {
      addToCartMutation.mutate({
        productId: product.id,
        quantity: quantity
      })
    })
  }

  const handleQuantityChange = (change, e) => {
    e.stopPropagation()
    const newQuantity = quantity + change
    if (newQuantity > 0) {
      setQuantity(newQuantity)
    }
  }

  return (
    <div className={`${showQuantitySelector ? 'flex items-center gap-2' : ''} ${className}`}>
      {showQuantitySelector && (
        <div className="flex items-center rounded-lg border">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleQuantityChange(-1, e)}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-[50px] px-3 py-1 text-center">{quantity}</span>
          <Button variant="ghost" size="sm" onClick={(e) => handleQuantityChange(1, e)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Button
        variant={variant}
        size={size}
        onClick={handleAddToCart}
        disabled={addToCartMutation.isPending || !product}
        className={`flex items-center gap-2 ${showQuantitySelector ? 'flex-1' : 'w-full'} h-10 w-50 text-[rgb(201,33,39)] hover:bg-gray-100 hover:text-red-700`}
      >
        <ShoppingCart className="h-4 w-4" />
        {addToCartMutation.isPending ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
      </Button>
    </div>
  )
}

export default AddToCartButton
