import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizedAxiosInstance from '@/utils/authorizeAxios'
import { API_ROOT } from '@/utils/constant'
import { toast } from 'react-toastify'

const initialState = {
  currentUser: null
}

export const loginUserAPI = createAsyncThunk('user/loginUserAPI', async (data) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
  return response.data
})

export const logoutUserAPI = createAsyncThunk('user/logoutUserAPI', async (showSuccessMessage = true) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/logout`)
  if (showSuccessMessage) {
    toast.success('Đăng xuất thành công!')
  }
  return response.data
})

export const updateUserAPI = createAsyncThunk('user/updateUserAPI', async (data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/profile/update`, data)
  return response.data
})

export const changePasswordAPI = createAsyncThunk('user/changePasswordAPI', async (data) => {
  const response = await authorizedAxiosInstance.put(`${API_ROOT}/v1/users/profile/change-password`, data)
  return response.data
})

export const googleLoginUserAPI = createAsyncThunk('user/googleLoginUserAPI', async (googleToken) => {
  const response = await authorizedAxiosInstance.post(`${API_ROOT}/v1/users/google-login`, { googleToken })
  return response.data
})

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
    })
    builder.addCase(logoutUserAPI.fulfilled, (state) => {
      state.currentUser = null
    })
    builder.addCase(updateUserAPI.fulfilled, (state, action) => {
      const response = action.payload
      const user = response.user || response
      state.currentUser = user
    })
    builder.addCase(googleLoginUserAPI.fulfilled, (state, action) => {
      const user = action.payload
      state.currentUser = user
    })
    builder.addCase(changePasswordAPI.fulfilled, () => {
      // Password change doesn't return user data
    })
  }
})

export const selectCurrentUser = (state) => {
  return state.user.currentUser
}

export const userReducer = userSlice.reducer
