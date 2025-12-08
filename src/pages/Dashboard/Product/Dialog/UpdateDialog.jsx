import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Pencil, X } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import { productSchema } from '@/utils/validatiors'
import FieldAlertError from '@/components/Form/FieldAlertError'
import { toast } from 'react-toastify'
import { updateProductAPI } from '@/apis'
import TextEditor from '@/components/DashBoard/Product/TextEditor'

export default function UpdateDialog({ product, categories, bookGenres, fetchData }) {
  const [open, setOpen] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('')
  const [productImageFiles, setProductImageFiles] = useState([])
  const [productImagePreviews, setProductImagePreviews] = useState([])
  const [existingProductImages, setExistingProductImages] = useState([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors }
  } = useForm({
    resolver: joiResolver(productSchema),
    shouldUnregister: true
  })

  const type = watch('type') || product?.type

  const handleSelectCategory = (val) => {
    const categoryBookId = categories?.find(
      (cat) => cat.name.normalize('NFD').toLowerCase() === 'sách'.normalize('NFD').toLowerCase()
    )?.id
    const selectedCategory = categories.find((cat) => cat.id === Number(val))
    if (selectedCategory?.id === categoryBookId) {
      setValue('type', 'BOOK')
    } else {
      setValue('type', 'STATIONERY')
    }
  }

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0]
    setCoverFile(file)
    if (file) {
      setCoverPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleProductImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length + productImageFiles.length > 10) {
      toast.error('Tối đa 10 ảnh sản phẩm')
      return
    }
    const newFiles = [...productImageFiles, ...files]
    setProductImageFiles(newFiles)
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setProductImagePreviews([...productImagePreviews, ...newPreviews])
  }

  const removeProductImage = (index, isExisting = false) => {
    if (isExisting) {
      // Remove from existing images
      const newExisting = existingProductImages.filter((_, i) => i !== index)
      setExistingProductImages(newExisting)
    } else {
      // Remove from new uploads
      const newFiles = productImageFiles.filter((_, i) => i !== index)
      const newPreviews = productImagePreviews.filter((_, i) => i !== index)
      setProductImageFiles(newFiles)
      // Revoke object URL
      URL.revokeObjectURL(productImagePreviews[index])
      setProductImagePreviews(newPreviews)
    }
  }

  const updateProduct = async (data) => {
    const formData = new FormData()
    const { bookDetail, stationeryDetail, ...rest } = data

    const payload = {
      ...rest,
      ...(data.type === 'BOOK' ? { bookDetail } : {}),
      ...(data.type === 'STATIONERY' ? { stationeryDetail } : {})
    }

    // Hàm đệ quy để append các trường của payload vào formData dưới dạng bracket-notation
    const appendPayload = (obj, parentKey = '') => {
      // Duyệt từng cặp [key, value] trong object hiện tại
      Object.entries(obj).forEach(([key, value]) => {
        // Nếu value là null hoặc undefined thì bỏ qua (không append)
        if (value == null) return

        // Tạo tên field:
        // - Nếu parentKey không rỗng (đang ở cấp nested), ghép thành "parentKey[key]"
        // - Nếu parentKey rỗng (cấp cao nhất), chỉ dùng "key"
        const name = parentKey ? `${parentKey}[${key}]` : key

        // Nếu value là một object con (và không phải array), gọi đệ quy xử lý tiếp
        if (typeof value === 'object' && !Array.isArray(value)) {
          appendPayload(value, name)
        } else {
          // Ngược lại (primitive như string/number/boolean), chuyển về chuỗi rồi append
          // String(value) đảm bảo giá trị luôn ở dạng text
          formData.append(name, String(value))
        }
      })
    }
    // Gọi hàm lần đầu với payload gốc để append toàn bộ trường
    appendPayload(payload)

    // Append cover image file
    if (coverFile) {
      formData.append('coverImageUrl', coverFile, coverFile.name)
    }

    // Append product images files (new uploads)
    if (productImageFiles && productImageFiles.length > 0) {
      productImageFiles.forEach((file) => {
        formData.append('productImages', file, file.name)
      })
    }

    // Always send existing product images as URLs (if any remain)
    // Backend will merge new files with existing URLs if both are provided
    if (existingProductImages.length > 0) {
      existingProductImages.forEach((img, index) => {
        const imageUrl = typeof img === 'string' ? img : img.imageUrl || img.image_url
        formData.append(`productImages[${index}][imageUrl]`, imageUrl)
      })
    }

    try {
      await updateProductAPI(product.id, formData)
      handleOpenChange(false)
      fetchData()
      toast.success('Sửa thông tin sản phẩm thành công!')
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message)
    }
  }

  const onValid = (data) => {
    console.log('✅ onValid, data:', data)
    updateProduct(data)
  }
  const onInvalid = (errors) => {
    console.log('❌ onInvalid, errors:', errors)
  }

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen)
    if (isOpen) {
      setValue('type', product?.type)
      setValue('description', product?.description || '')
      setCoverPreviewUrl(product?.coverImageUrl || '')
      // Initialize existing product images
      const images = product?.productImages || []
      setExistingProductImages(images)
      setProductImageFiles([])
      setProductImagePreviews([])
    } else {
      // Cleanup when closing
      setCoverFile(null)
      setCoverPreviewUrl('')
      setProductImageFiles([])
      productImagePreviews.forEach((url) => URL.revokeObjectURL(url))
      setProductImagePreviews([])
      setExistingProductImages([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="dark:hover:text-error-500 mr-2 cursor-pointer p-[1px] font-medium text-gray-600 underline hover:text-blue-600 dark:text-gray-400"
          // onClick={() => handleOpen()}
        >
          <Pencil size={18} />
        </button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Sửa thông tin sản phẩm</DialogTitle>
          <DialogDescription>Thay đổi thông tin sản phẩm bạn muốn sửa.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid, onInvalid)}>
          <div className="flex max-h-[520px] w-full scroll-py-0 flex-col gap-3 overflow-y-auto px-2 py-3">
            {/* name */}
            <div className="flex w-full flex-col gap-1">
              <Label className="mb-1 gap-0 pl-[3px]" htmlFor="name">
                Tên sản phẩm<span className="text-red-500">*</span>
              </Label>
              <Input
                className="z-1 h-10 w-full bg-white"
                id="name"
                type="text"
                placeholder="VD: Trường Ca Achilles"
                {...register('name')}
                defaultValue={product?.name}
              />
              <FieldAlertError errors={errors} fieldName={'name'} />
            </div>

            {/* categoryId */}
            <div className="flex w-[250px] flex-col gap-1.5">
              <Label className="gap-0 pl-[3px]">
                Danh mục<span className="text-red-500">*</span>
              </Label>
              <Controller
                name="categoryId"
                defaultValue={product?.categoryId}
                control={control}
                render={({ field }) => (
                  <Select
                    value={String(field.value || '')}
                    onValueChange={(val) => {
                      field.onChange(Number(val))
                      handleSelectCategory(val)
                    }}
                  >
                    <SelectTrigger className="z-1 mb-[-3px] w-[250px] bg-white">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px]">
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldAlertError errors={errors} fieldName="categoryId" />
              <Input type="hidden" {...register('type')} />
            </div>

            {/* bookDetail */}
            {type === 'BOOK' && (
              <>
                <div className="flex w-[250px] flex-col gap-1.5">
                  <Label className="gap-0 pl-[3px]">
                    Thể loại sách<span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="bookDetail.bookGenreId"
                    defaultValue={product?.bookDetail?.bookGenreId}
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={String(field.value || '')}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger className="z-1 mb-[-3px] w-[250px] bg-white">
                          <SelectValue placeholder="Chọn thể loại" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[250px]">
                          {bookGenres.map((genre) => (
                            <SelectItem key={genre.id} value={String(genre.id)}>
                              {genre.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldAlertError errors={errors} fieldName="bookDetail.bookGenreId" />
                </div>

                {/* author */}
                <div className="flex w-full flex-col gap-1">
                  <Label className="mb-1 gap-0 pl-[3px] italic" htmlFor="author">
                    Tác giả<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="z-1 h-10 w-full bg-white"
                    id="author"
                    type="text"
                    defaultValue={product?.bookDetail?.author}
                    {...register('bookDetail.author')}
                    placeholder="VD: Nguyễn Văn A"
                  />
                  <FieldAlertError errors={errors} fieldName="bookDetail.author" />
                </div>

                {/* translator */}
                <div className="flex w-full flex-col gap-1">
                  <Label className="mb-1 pl-[3px] font-medium italic" htmlFor="translator">
                    Người dịch (Nếu có)
                  </Label>
                  <Input
                    className="z-1 h-10 w-full bg-white"
                    id="translator"
                    type="text"
                    defaultValue={product?.bookDetail?.translator}
                    {...register('bookDetail.translator')}
                  />
                  <FieldAlertError errors={errors} fieldName="bookDetail.translator" />
                </div>

                {/* language */}
                <div className="flex w-full flex-col gap-1">
                  <Label className="mb-1 gap-0 pl-[3px] italic" htmlFor="language">
                    Ngôn ngữ<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="z-1 h-10 w-full bg-white"
                    id="language"
                    type="text"
                    defaultValue={product?.bookDetail?.language}
                    {...register('bookDetail.language')}
                  />
                  <FieldAlertError errors={errors} fieldName="bookDetail.language" />
                </div>

                {/* publisher */}
                <div className="flex w-full flex-col gap-1">
                  <Label className="mb-1 gap-0 pl-[3px] italic" htmlFor="publisher">
                    Nhà xuất bản<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="z-1 h-10 w-full bg-white"
                    id="publisher"
                    type="text"
                    defaultValue={product?.bookDetail?.publisher}
                    {...register('bookDetail.publisher')}
                  />
                  <FieldAlertError errors={errors} fieldName="bookDetail.publisher" />
                </div>

                {/* publishYear */}
                <div className="flex w-full flex-col gap-1">
                  <Label className="mb-1 gap-0 pl-[3px] font-medium italic" htmlFor="publishYear">
                    Năm xuất bản<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="z-1 h-10 w-full bg-white"
                    id="publishYear"
                    type="text"
                    defaultValue={product?.bookDetail?.publishYear}
                    {...register('bookDetail.publishYear')}
                  />
                  <FieldAlertError errors={errors} fieldName="bookDetail.publishYear" />
                </div>

                {/* pageCount */}
                <div className="flex w-full flex-col gap-1">
                  <Label className="mb-1 gap-0 pl-[3px] italic" htmlFor="pageCount">
                    Số trang<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="z-1 h-10 w-full bg-white"
                    id="pageCount"
                    type="text"
                    defaultValue={product?.bookDetail?.pageCount}
                    {...register('bookDetail.pageCount')}
                  />
                  <FieldAlertError errors={errors} fieldName="bookDetail.pageCount" />
                </div>
              </>
            )}

            {type === 'STATIONERY' && (
              <>
                {/* brand */}
                <div className="flex w-full flex-col gap-1">
                  <Label className="mb-1 gap-0 pl-[3px] italic" htmlFor="brand">
                    Thương hiệu<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="z-1 h-10 w-full bg-white"
                    id="brand"
                    type="text"
                    defaultValue={product?.stationeryDetail?.brand}
                    {...register('stationeryDetail.brand')}
                    placeholder="VD: Nguyễn Văn A"
                  />
                  <FieldAlertError errors={errors} fieldName="stationeryDetail.brand" />
                </div>

                {/* placeProduction */}
                <div className="flex w-full flex-col gap-1">
                  <Label className="mb-1 gap-0 pl-[3px] italic" htmlFor="placeProduction">
                    Nơi sản xuất<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="z-1 h-10 w-full bg-white"
                    id="placeProduction"
                    type="text"
                    defaultValue={product?.stationeryDetail?.placeProduction}
                    {...register('stationeryDetail.placeProduction')}
                    placeholder="VD: Nguyễn Văn A"
                  />
                  <FieldAlertError errors={errors} fieldName="stationeryDetail.placeProduction" />
                </div>

                {/* color */}
                <div className="flex w-full flex-col gap-1">
                  <Label className="mb-1 gap-0 pl-[3px] italic" htmlFor="color">
                    Màu sắc (Nếu có)
                  </Label>
                  <Input
                    className="z-1 h-10 w-full bg-white"
                    id="color"
                    type="text"
                    defaultValue={product?.stationeryDetail?.color}
                    {...register('stationeryDetail.color')}
                  />
                  <FieldAlertError errors={errors} fieldName="stationeryDetail.color" />
                </div>

                {/* material */}
                <div className="flex w-full flex-col gap-1">
                  <Label className="mb-1 gap-0 pl-[3px] italic" htmlFor="material">
                    Chất liệu (Nếu có)
                  </Label>
                  <Input
                    className="z-1 h-10 w-full bg-white"
                    id="material"
                    type="text"
                    defaultValue={product?.stationeryDetail?.material}
                    {...register('stationeryDetail.material')}
                  />
                  <FieldAlertError errors={errors} fieldName="stationeryDetail.material" />
                </div>
              </>
            )}

            {/* price */}
            <div className="flex w-full flex-col gap-1">
              <Label className="mb-1 gap-0 pl-[3px]" htmlFor="price">
                Giá<span className="text-red-500">*</span>
              </Label>
              <Input
                className="z-1 h-10 w-full bg-white"
                id="price"
                type="text"
                defaultValue={product?.price}
                {...register('price')}
              />
              <FieldAlertError errors={errors} fieldName="price" />
            </div>
            {/* discount */}
            <div className="flex w-full flex-col gap-1">
              <Label className="mb-1 gap-0 pl-[3px]" htmlFor="discount">
                Giảm giá(%)<span className="text-red-500">*</span>
              </Label>
              <Input
                className="z-1 h-10 w-full bg-white"
                id="discount"
                type="text"
                defaultValue={product?.discount}
                {...register('discount')}
              />
              <FieldAlertError errors={errors} fieldName="discount" />
            </div>
            {/* stock */}
            <div className="flex w-full flex-col gap-1">
              <Label className="mb-1 gap-0 pl-[3px]" htmlFor="stock">
                Số lượng<span className="text-red-500">*</span>
              </Label>
              <Input
                className="z-1 h-10 w-full bg-white"
                id="stock"
                type="text"
                defaultValue={product?.stock}
                {...register('stock')}
              />
              <FieldAlertError errors={errors} fieldName="stock" />
            </div>
            {/* description */}
            <div className="flex w-full flex-col gap-1">
              <Label className="mb-1 gap-0 pl-[3px]" htmlFor="description">
                Mô tả<span className="text-red-500">*</span>
              </Label>
              <Controller
                name="description"
                defaultValue={product?.description || ''}
                control={control}
                render={({ field }) => (
                  <TextEditor
                    value={field.value}
                    onChange={(content) => {
                      if (content === '<p><br></p>') {
                        field.onChange('')
                      } else {
                        field.onChange(content)
                      }
                    }}
                    onBlur={() => field.onBlur()}
                  />
                )}
              />
              <FieldAlertError errors={errors} fieldName="description" />
            </div>
            {/* Cover Image */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="coverImageUrl" className="gap-0 pl-[3px]">
                Ảnh bìa<span className="text-red-500">*</span>
              </Label>

              <Input
                type="file"
                id="coverImageUrl"
                accept="image/*"
                className="z-1 bg-white"
                onChange={(e) => {
                  handleCoverImageChange(e)
                }}
              />
              <FieldAlertError errors={errors} fieldName="coverImageUrl" />

              {coverPreviewUrl && (
                <div className="mx-auto mt-1 h-34 w-34">
                  <img
                    src={coverPreviewUrl}
                    alt="Cover preview"
                    className="h-full w-full rounded object-cover"
                  />
                </div>
              )}
            </div>

            {/* Product Images */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="productImages" className="gap-0 pl-[3px]">
                Ảnh sản phẩm (Tối đa 10 ảnh)
              </Label>
              <Input
                type="file"
                id="productImages"
                accept="image/*"
                multiple
                className="z-1 bg-white"
                onChange={handleProductImagesChange}
              />

              {/* Existing product images */}
              {existingProductImages.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 text-sm text-gray-600">Ảnh hiện có:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingProductImages.map((img, index) => {
                      const imageUrl = typeof img === 'string' ? img : img.imageUrl || img.image_url
                      return (
                        <div key={index} className="relative h-24 w-24">
                          <img
                            src={imageUrl}
                            alt={`Existing product ${index + 1}`}
                            className="h-full w-full rounded object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeProductImage(index, true)}
                            className="absolute top-1 right-1 rounded bg-red-500 p-0.5 text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* New product image previews */}
              {productImagePreviews.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 text-sm text-gray-600">Ảnh mới:</p>
                  <div className="flex flex-wrap gap-2">
                    {productImagePreviews.map((preview, index) => (
                      <div key={index} className="relative h-24 w-24">
                        <img
                          src={preview}
                          alt={`Product preview ${index + 1}`}
                          className="h-full w-full rounded object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeProductImage(index, false)}
                          className="absolute top-1 right-1 rounded bg-red-500 p-0.5 text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex w-full flex-col gap-1">
              {/* dimension */}
              <Label className="mb-1 pl-[3px]" htmlFor="dimension">
                Kích thước (Nếu có)
              </Label>
              <Input
                className="z-1 h-10 w-full bg-white"
                id="dimension"
                type="text"
                {...register('dimension')}
              />
            </div>
          </div>

          <DialogFooter className="mt-2 mr-4">
            <DialogClose asChild>
              <Button type="button" className="ml-auto w-20 bg-gray-500 hover:bg-gray-600">
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit" className="w-25">
              Xác nhận
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
