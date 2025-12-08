import Joi from 'joi'

// Users
export const FIELD_REQUIRED_MESSAGE = 'Vui lòng không để trống!'
export const EMAIL_RULE = /^\S+@\S+\.\S+$/
export const EMAIL_RULE_MESSAGE = 'Email không đúng định dạng! (example@gmail.com)'
export const PASSWORD_RULE = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d\W]{8,256}$/
export const PASSWORD_RULE_MESSAGE = 'Mật khẩu phải gồm ít nhất 1 chữ, 1 số và có ít nhất 8 ký tự!'
export const PASSWORD_CONFIRMATION_MESSAGE = 'Mật khẩu không trùng khớp!'

// Categories
export const categorySchema = Joi.object({
  name: Joi.string().required().min(3).max(50).trim().messages({
    // 'any.required': 'Tên danh mục là bắt buộc',
    'string.empty': 'Vui lòng nhập tên danh mục!',
    'string.max': 'Tên danh mục phải ít hơn hoặc bằng 50 ký tự!',
    'string.min': 'Tên danh mục phải nhiều hơn 3 ký tự!'
  })
})

// BookGenre
export const BookGenreSchema = Joi.object({
  name: Joi.string().required().min(3).max(50).trim().messages({
    'string.empty': 'Vui lòng nhập tên thể loại!',
    'string.min': 'Tên thể loại phải nhiều hơn 3 ký tự!',
    'string.max': 'Tên thể loại phải ít hơn hoặc bằng 50 ký tự!'
  })
})

// Product
export const productSchema = Joi.object({
  categoryId: Joi.number().integer().required().messages({
    'any.required': 'Vui lòng chọn danh mục!',
    'string.empty': 'Vui lòng chọn danh mục!'
  }),

  name: Joi.string().min(3).max(50).required().trim().messages({
    'string.empty': 'Vui lòng nhập tên sản phẩm!',
    'string.min': 'Tên sản phẩm phải nhiều hơn 3 ký tự!',
    'string.max': 'Tên sản phẩm phải ít hơn hoặc bằng 50 ký tự!'
  }),

  price: Joi.number().positive().empty('').required().messages({
    'any.required': 'Vui lòng nhập giá sản phẩm!',
    'number.base': 'Giá sản phẩm phải là một con số!',
    'number.positive': 'Giá sản phẩm phải là số dương!'
  }),

  discount: Joi.number().min(0).max(100).empty('').required().messages({
    'any.required': 'Vui lòng nhập giảm giá!',
    'number.base': 'Giảm giá phải là một con số!',
    'number.min': 'Giảm giá phải là giá trị trong khoảng 0 đến 100!',
    'number.max': 'Giảm giá phải là giá trị trong khoảng 0 đến 100!'
  }),

  stock: Joi.number().min(0).empty('').required().messages({
    'any.required': 'Vui lòng nhập số lượng!',
    'number.base': 'Số lượng phải là một con số!',
    'number.min': 'Số lượng phải là giá trị lớn hơn hoặc bằng 0!'
  }),

  description: Joi.string().min(10).max(10000).required().trim().messages({
    'any.required': 'Vui lòng nhập mô tả!',
    'string.empty': 'Vui lòng nhập mô tả!',
    'string.min': 'Mô tả phải nhiều hơn 10 ký tự!',
    'string.max': 'Mô tả phải ít hơn hoặc bằng 10000 ký tự!'
  }),

  coverImageUrl: Joi.any()
    .custom((value, helpers) => {
      // nếu chưa chọn file
      if (!value || value.length === 0) {
        return helpers.error('coverImageUrl.required')
      }
      // nếu chọn nhiều hơn hoặc ít hơn 1 file
      if (value.length !== 1) {
        return helpers.error('coverImageUrl.onlyOne')
      }
      return value
    })
    .messages({
      'coverImageUrl.required': 'Vui lòng chọn ảnh bìa!',
      'coverImageUrl.onlyOne': 'Chỉ được chọn duy nhất 1 ảnh bìa!'
    }),

  dimension: Joi.string().max(50).allow('').trim(),

  type: Joi.string().valid('BOOK', 'STATIONERY').required(),

  bookDetail: Joi.alternatives().conditional('type', {
    is: 'BOOK',
    then: Joi.object({
      bookGenreId: Joi.number().integer().required().messages({
        'any.required': 'Vui lòng chọn thể loại!',
        'string.empty': 'Vui lòng chọn thể loại!'
      }),
      author: Joi.string().max(100).required().trim().messages({
        'string.empty': 'Vui lòng nhập tên tác giả!',
        'string.max': 'Tên tác giả phải ít hơn hoặc bằng 100 ký tự!'
      }),
      translator: Joi.string().max(100).allow('').trim().messages({
        'string.max': 'Tên người dịch phải ít hơn hoặc bằng 100 ký tự!'
      }),
      language: Joi.string().max(100).required().trim().messages({
        'string.empty': 'Vui lòng nhập ngôn ngữ!',
        'string.max': 'Ngôn ngữ phải ít hơn hoặc bằng 100 ký tự!'
      }),
      publisher: Joi.string().trim().min(1).max(100).required().messages({
        'string.empty': 'Vui lòng nhập nhà xuất bản!',
        'string.min': 'Nhà xuất bản không được để trống!',
        'string.max': 'Nhà xuất bản phải ít hơn hoặc bằng 100 ký tự!'
      }),
      publishYear: Joi.number()
        .integer()
        .min(1900)
        .max(new Date().getFullYear())
        .required()
        .messages({
          'any.required': 'Vui lòng nhập năm xuất bản!',
          'number.base': 'Năm xuất bản phải là một số!',
          'number.integer': 'Năm xuất bản phải là số nguyên!',
          'number.min': 'Năm xuất bản phải từ 1900 trở lên!',
          'number.max': `Năm xuất bản không được vượt quá ${new Date().getFullYear()}!`
        }),
      pageCount: Joi.number().integer().min(1).required().messages({
        'any.required': 'Vui lòng nhập số trang!',
        'number.base': 'Số trang phải là một số!',
        'number.integer': 'Số trang phải là số nguyên!',
        'number.min': 'Số trang phải lớn hơn hoặc bằng 1!'
      })
    }).required(),
    otherwise: Joi.forbidden()
  }),

  stationeryDetail: Joi.alternatives().conditional('type', {
    is: 'STATIONERY',
    then: Joi.object({
      brand: Joi.string().trim().min(1).max(50).required().messages({
        'string.empty': 'Vui lòng nhập tên thương hiệu!',
        'string.min': 'Tên thương hiệu phải nhiều hơn 1 ký tự!',
        'string.max': 'Tên thương hiệu phải ít hơn hoặc bằng 50 ký tự!'
      }),
      placeProduction: Joi.string().trim().min(1).max(100).required().messages({
        'string.empty': 'Vui lòng nhập nơi sản xuất!',
        'string.min': 'Nơi sản xuất phải nhiều hơn 1 ký tự!',
        'string.max': 'Nơi sản xuất phải ít hơn hoặc bằng 100 ký tự!'
      }),
      color: Joi.string().allow('').trim().max(50).required().messages({
        'string.max': 'Màu sắc phải ít hơn hoặc bằng 50 ký tự!'
      }),
      material: Joi.string().allow('').trim().max(50).required().messages({
        'string.max': 'Chất liệu phải ít hơn hoặc bằng 50 ký tự!'
      })
    }).required(),
    otherwise: Joi.forbidden()
  })
})
