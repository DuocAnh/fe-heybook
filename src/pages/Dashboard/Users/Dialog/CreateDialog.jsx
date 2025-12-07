import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, X } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import Joi from 'joi'
import FieldAlertError from '@/components/Form/FieldAlertError'
import { createUserAPI } from '@/apis'
import { toast } from 'react-toastify'
import { uploadToCloudinary } from '@/utils/cloudinary'

const userSchema = Joi.object({
  userName: Joi.string().required().messages({
    'string.empty': 'Tên người dùng không được để trống',
    'any.required': 'Tên người dùng là bắt buộc'
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Mật khẩu không được để trống',
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc'
  }),
  address: Joi.string().allow('').optional().messages({
    'string.empty': 'Địa chỉ có thể để trống'
  }),
  role: Joi.string().valid('ADMIN', 'STAFF', 'CLIENT').required().messages({
    'any.only': 'Vai trò phải là ADMIN, STAFF hoặc CLIENT',
    'any.required': 'Vai trò là bắt buộc'
  }),
  isActive: Joi.boolean().required(),
  avatar: Joi.string().allow('', null).optional()
})

export function CreateDialog({ getUsers }) {
  const [open, setOpen] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: joiResolver(userSchema),
    defaultValues: {
      role: 'CLIENT',
      isActive: true
    }
  })

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarFile(file)
    setAvatarPreviewUrl(URL.createObjectURL(file))
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreviewUrl('')
    setValue('avatar', '', { shouldValidate: true })
    // Reset file input
    const fileInput = document.getElementById('avatar')
    if (fileInput) fileInput.value = ''
  }

  const createUser = async (data) => {
    setIsLoading(true)
    try {
      let avatarUrl = ''

      // Upload avatar nếu có file được chọn
      if (avatarFile) {
        setIsUploading(true)
        try {
          const uploadResult = await uploadToCloudinary(avatarFile)
          avatarUrl = uploadResult.url
        } catch (uploadError) {
          toast.error('Upload avatar thất bại: ' + uploadError.message)
          return
        } finally {
          setIsUploading(false)
        }
      }

      const userData = {
        ...data,
        avatar: avatarUrl || data.avatar || ''
      }

      const res = await createUserAPI(userData)
      if (!res.error) {
        toast.success('Thêm người dùng thành công!')
        getUsers()
        reset()
        setAvatarFile(null)
        setAvatarPreviewUrl('')
        setOpen(false)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      reset()
      clearErrors()
      setAvatarFile(null)
      setAvatarPreviewUrl('')
    }
    setOpen(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="ml-2">
          <Plus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Thêm người dùng mới</DialogTitle>
          <DialogDescription>Nhập thông tin để tạo người dùng mới. Nhấn lưu khi hoàn tất.</DialogDescription>
        </DialogHeader>{' '}
        <form onSubmit={handleSubmit(createUser)}>
          <div className="grid gap-4 py-4">
            {/* Tên người dùng */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="userName">
                Tên người dùng<span className="text-red-500">*</span>
              </Label>
              <Input
                id="userName"
                placeholder="Nhập tên người dùng"
                {...register('userName')}
                className="relative z-[1] bg-white"
              />
              <FieldAlertError errors={errors} fieldName="userName" />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">
                Email<span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email"
                {...register('email')}
                className="relative z-[1] bg-white"
              />
              <FieldAlertError errors={errors} fieldName="email" />
            </div>

            {/* Địa chỉ */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                type="text"
                placeholder="Nhập địa chỉ"
                {...register('address')}
                className="relative z-[1] bg-white"
              />
              <FieldAlertError errors={errors} fieldName="address" />
            </div>

            {/* Mật khẩu */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">
                Mật khẩu<span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                {...register('password')}
                className="relative z-[1] bg-white"
              />
              <FieldAlertError errors={errors} fieldName="password" />
            </div>

            {/* Avatar */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="avatar">Avatar</Label>
              <Input
                type="file"
                id="avatar"
                accept="image/*"
                className="relative z-[1] bg-white"
                onChange={handleAvatarChange}
              />
              <FieldAlertError errors={errors} fieldName="avatar" />

              {avatarPreviewUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={avatarPreviewUrl}
                      alt="Avatar preview"
                      className="h-20 w-20 rounded-full border-2 border-gray-200 object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeAvatar}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Xóa ảnh
                  </Button>
                </div>
              )}
            </div>

            {/* Vai trò */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">
                Vai trò<span className="text-red-500">*</span>
              </Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="relative z-[1] bg-white">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLIENT">Khách hàng</SelectItem>
                      <SelectItem value="STAFF">Nhân viên</SelectItem>
                      <SelectItem value="ADMIN">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldAlertError errors={errors} fieldName="role" />
            </div>

            {/* Trạng thái hoạt động */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="isActive">Trạng thái hoạt động</Label>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
                    <Label htmlFor="isActive">{field.value ? 'Hoạt động' : 'Không hoạt động'}</Label>
                  </div>
                )}
              />
              <FieldAlertError errors={errors} fieldName="isActive" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isUploading ? 'Đang upload avatar...' : isLoading ? 'Đang tạo...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
