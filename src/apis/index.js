import axios from 'axios'
import { API_ROOT } from '@/utils/constant'
import authorizedAxiosInstance from '@/utils/authorizeAxios'

/** Users */
export const registerUserAPI = async (data) => {
  const response = await axios.post(`${API_ROOT}/v1/users/register`, data)
  return response.data
}

// export const verifyUserAPI = async (data) => {
//   const response = await axios.put(`${API_ROOT}/v1/users/verify`, data)
//   toast.success(
//     'Account verified successfully! Now you can login to enjoy our services! Have a good day!',
//     {
//       theme: 'colored'
//     }
//   )
//   return response.data
// }

export const refreshTokenAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/refresh-token`)
  return response.data
}

export const getUserProfileAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/profile`)
  return response.data
}

// Google login
export const googleLoginAPI = async (googleToken) => {
  const response = await axios.post(`${API_ROOT}/v1/users/google-login`, {
    googleToken
  })
  return response.data
}

// *** Categories ***
export const getCategoriesAPI = async (searchPath) => {
  if (!searchPath) searchPath = ''
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/categories${searchPath}`)
  return response.data
}

export const getCategoryByIdAPI = async (categoryId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/categories/${categoryId}`)
  return response.data
}

export const createCategoryAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/categories`, data)
  return response.data
}

export const updateCategoryAPI = async (categoryId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/categories/${categoryId}`, data)
  return response.data
}

export const deleteCategoryAPI = async (categoryId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/categories/${categoryId}`)
  return response.data
}

// BookGenres
export const getBookGenresAPI = async (searchPath) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/book-genres${searchPath}`)
  return response.data
}

export const createBookGenreAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/book-genres`, data)
  return response.data
}

export const updateBookGenreAPI = async (bookGenreId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/book-genres/${bookGenreId}`, data)
  return response.data
}

export const deleteBookGenreAPI = async (bookGenreId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/book-genres/${bookGenreId}`)
  return response.data
}

// Product
export const createProductAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/products`, data)
  return response.data
}

export const getCategoriesForProductAPI = async () => {
  const response = await axios.get(`${API_ROOT}/v1/products/categories`)
  return response.data
}

export const getBookGenresForProductAPI = async () => {
  const response = await axios.get(`${API_ROOT}/v1/products/book-genres`)
  return response.data
}

export const getProductsAPI = async (searchPath = '') => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/products${searchPath}`)
  return response.data
}

export const getProductByIdAPI = async (productId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/products/${productId}`)
  return response.data
}

export const updateProductAPI = async (productId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/products/${productId}`, data)
  return response.data
}

export const deleteProductAPI = async (productId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/products/${productId}`)
  return response.data
}

// *** Users Management ***
export const getUsersAPI = async (searchPath = '') => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/admin/users${searchPath}`)
  return response.data
}

export const getUserByIdAPI = async (userId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/users/admin/users/${userId}`)
  return response.data
}

export const updateUserAPI = async (userId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/admin/users/${userId}`, data)
  return response.data
}

export const deleteUserAPI = async (userId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/users/admin/users/${userId}`)
  return response.data
}

export const createUserAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/admin/users`, data)
  return response.data
}

// *** Coupons ***
export const getCouponsAPI = async (searchPath = '') => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/coupons${searchPath}`)
  return response.data
}

export const getCouponByIdAPI = async (couponId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/coupons/${couponId}`)
  return response.data
}

export const createCouponAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/coupons`, data)
  return response.data
}

export const updateCouponAPI = async (couponId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/coupons/${couponId}`, data)
  return response.data
}

export const deleteCouponAPI = async (couponId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/coupons/${couponId}`)
  return response.data
}

// Search and Filter Products
export const searchAndFilterProductsAPI = async (filters) => {
  const queryParams = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value)
    }
  })
  const queryString = queryParams.toString()
  const response = await axios.get(`${API_ROOT}/v1/products/search${queryString ? `?${queryString}` : ''}`)
  return response.data
}

// *** Cart APIs ***
export const getCartAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/cart`)
  return response.data
}

export const addToCartAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/cart/add`, data)
  return response.data
}

export const updateCartItemAPI = async (cartItemId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/cart/items/${cartItemId}`, data)
  return response.data
}

export const removeCartItemAPI = async (cartItemId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/cart/items/${cartItemId}`)
  return response.data
}

export const clearCartAPI = async () => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/cart/clear`)
  return response.data
}

export const applyCouponAPI = async (couponCode) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/cart/coupon`, { couponCode })
  return response.data
}

export const removeCouponAPI = async () => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/cart/coupon`)
  return response.data
}

// *** Order APIs ***
export const createOrderAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/orders`, data)
  return response.data
}

export const getUserOrdersAPI = async (page = 1, itemsPerPage = 10) => {
  const response = await authorizedAxiosInstance.get(
    `${API_ROOT}/v1/orders?page=${page}&itemsPerPage=${itemsPerPage}`
  )
  return response.data
}

export const getOrderByIdAPI = async (orderId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/orders/${orderId}`)
  return response.data
}

export const getOrderByNumberAPI = async (orderNumber) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/orders/number/${orderNumber}`)
  return response.data
}

export const cancelOrderAPI = async (orderId) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/orders/${orderId}/cancel`)
  return response.data
}

export const updatePaymentStatusAPI = async (orderNumber, paymentData) => {
  const response = await authorizedAxiosInstance.put(
    `${API_ROOT}/v1/orders/payment/${orderNumber}`,
    paymentData
  )
  return response.data
}

// *** Admin Order APIs ***
export const getAllOrdersAdminAPI = async (page = 1, itemsPerPage = 10, filters = {}) => {
  const queryParams = new URLSearchParams({
    page,
    itemsPerPage,
    ...filters
  })
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/orders/admin/all?${queryParams}`)
  return response.data
}

export const getOrderByIdAdminAPI = async (orderId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/orders/admin/${orderId}`)
  return response.data
}

export const updateOrderStatusAdminAPI = async (orderId, status) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/orders/admin/${orderId}/status`, {
    status
  })
  return response.data
}

// *** Review APIs ***
export const createReviewAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/reviews`, data)
  return response.data
}

export const getProductReviewsAPI = async (productId, page = 1, itemsPerPage = 10) => {
  const response = await axios.get(
    `${API_ROOT}/v1/reviews/product/${productId}?page=${page}&itemsPerPage=${itemsPerPage}`
  )
  return response.data
}

export const getProductRatingStatsAPI = async (productId) => {
  const response = await axios.get(`${API_ROOT}/v1/reviews/product/${productId}/stats`)
  return response.data
}

export const checkUserReviewAPI = async (productId) => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/reviews/product/${productId}/check`)
  return response.data
}

export const updateReviewAPI = async (reviewId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/reviews/${reviewId}`, data)
  return response.data
}

export const deleteReviewAPI = async (reviewId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/reviews/${reviewId}`)
  return response.data
}

// *** Addresses ***
export const getUserAddressesAPI = async (searchPath = '') => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/addresses${searchPath}`)
  return response.data
}

export const getDefaultAddressAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/addresses/default`)
  return response.data
}

export const createAddressAPI = async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/addresses`, data)
  return response.data
}

export const updateAddressAPI = async (addressId, data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/addresses/${addressId}`, data)
  return response.data
}

export const deleteAddressAPI = async (addressId) => {
  const response = await authorizedAxiosInstance.delete(`${API_ROOT}/v1/addresses/${addressId}`)
  return response.data
}

export const setDefaultAddressAPI = async (addressId) => {
  const response = await authorizedAxiosInstance.patch(`${API_ROOT}/v1/addresses/${addressId}/set-default`)
  return response.data
}
// *** Revenue APIs ***
export const getLast6MonthsRevenueAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/orders/admin/revenue/last-6-months`)
  return response.data
}
export const getStatsCurrentMonthAPI = async () => {
  const response = await authorizedAxiosInstance.get(`${API_ROOT}/v1/orders/admin/stats/current-month`)
  return response.data
}
export const getTrendingProductsAPI = async () => {
  const response = await axios.get(`${API_ROOT}/v1/products/trend-products`)
  return response.data
}