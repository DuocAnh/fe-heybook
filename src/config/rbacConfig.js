export const roles = {
  CLIENT: 'CLIENT',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN'
}

export const permissions = {
  VIEW_CLIENT: 'VIEW_CLIENT',
  VIEW_ADMIN: 'VIEW_ADMIN',
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_DISCOUNTS: 'MANAGE_DISCOUNTS',
  MANAGE_CATEGORIES: 'MANAGE_CATEGORIES',
  MANAGE_BOOK_GENRES: 'MANAGE_BOOK_GENRES',
  MANAGE_PRODUCTS: 'MANAGE_PRODUCTS',
  MANAGE_ORDERS: 'MANAGE_ORDERS'
}

export const rolePermissions = {
  [roles.CLIENT]: [permissions.VIEW_CLIENT],
  [roles.STAFF]: [
    permissions.VIEW_ADMIN,
    permissions.MANAGE_CATEGORIES,
    permissions.MANAGE_BOOK_GENRES,
    permissions.MANAGE_PRODUCTS,
    permissions.MANAGE_DISCOUNTS,
    permissions.MANAGE_ORDERS
  ],
  [roles.ADMIN]: [
    permissions.VIEW_ADMIN,
    permissions.MANAGE_USERS,
    permissions.MANAGE_CATEGORIES,
    permissions.MANAGE_BOOK_GENRES,
    permissions.MANAGE_PRODUCTS,
    permissions.MANAGE_DISCOUNTS,
    permissions.MANAGE_ORDERS
  ]
}
