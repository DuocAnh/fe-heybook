import {
  Search,
  Bell,
  User,
  ChevronDown,
  Menu,
  LogOut,
  Settings,
  BookText,
  LibraryBig,
  PencilRuler,
  Dot,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CartIcon from '@/components/CartIcon'
import { getCategoriesForProductAPI, getBookGenresForProductAPI } from '@/apis'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUserAPI, selectCurrentUser } from '@/redux/userSlice'
import { setSearchQuery, selectSearchQuery } from '@/redux/searchSlice'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentUser = useSelector(selectCurrentUser)
  const searchQuery = useSelector(selectSearchQuery) || ''
  const [inputValue, setInputValue] = useState('')
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [selectedMainCategory, setSelectedMainCategory] = useState('Sách')
  const categoryMenuRef = useRef(null)
  const [categories, setCategories] = useState([])
  const [bookGenres, setBookGenres] = useState([])

  const categoryData = useMemo(
    () => ({
      Sách: bookGenres.map((genre) => genre.name),
      'Văn phòng phẩm': categories.map((cat) => cat.name)
    }),
    [categories, bookGenres]
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, bookGenresData] = await Promise.all([
          getCategoriesForProductAPI(),
          getBookGenresForProductAPI()
        ])
        setCategories(categoriesData)
        setBookGenres(bookGenresData)
      } catch {
        // Handle error silently for now
        setCategories([])
        setBookGenres([])
      }
    }
    fetchData()
  }, [])
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || ''

    if (searchFromUrl !== searchQuery) {
      dispatch(setSearchQuery(searchFromUrl))
    }

    setInputValue(searchFromUrl || searchQuery)
  }, [searchParams, dispatch, searchQuery])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setShowCategoryMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      const searchTerm = inputValue.trim()
      dispatch(setSearchQuery(searchTerm))
      navigate(`/product-list?search=${encodeURIComponent(searchTerm)}`)
    }
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)
  }

  const handleLogout = async () => {
    try {
      await dispatch(logoutUserAPI()).unwrap()
      navigate('/login')
    } catch {
      // Error handling
    }
  }

  const handleAdminAccess = () => {
    navigate('/dashboard')
  }

  const handleProfile = () => {
    navigate('/profile')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleRegister = () => {
    navigate('/register')
  }

  const handleCategoryClick = (mainCategory, subCategory) => {
    const type = mainCategory === 'Sách' ? 'BOOK' : 'STATIONERY'

    // setSearchQuery nếu bạn vẫn muốn lưu từ khóa tìm kiếm vào Redux
    dispatch(setSearchQuery(subCategory))

    navigate(
      `/product-list?type=${type}&bookGenreId=${encodeURIComponent(subCategory)}&page=1&itemsPerPage=12`
    )
  }

  return (
    <header className="border-b border-gray-200 bg-white py-1 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center pr-3">
            <Link to="/" className="flex items-center">
              <div className="flex w-9 items-center justify-center text-[rgb(201,33,39)]">
                <BookText size={30} strokeWidth={2.4} />
              </div>
              <span className="text-xl font-bold text-[rgb(201,33,39)]">HeyBook.com</span>
            </Link>
          </div>
          <div ref={categoryMenuRef} className="relative ml-3 hidden items-center md:flex">
            <Button
              variant="outline"
              className="flex items-center space-x-2 border-gray-300"
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            >
              <Menu className="h-4 w-4" />
              <span className="text-sm">Danh mục</span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* Dropdown hiển thị 2 cột */}
            {showCategoryMenu && (
              <div className="absolute top-full left-0 z-50 mt-2 flex w-[480px] rounded border bg-white shadow-lg">
                {/* Cột 1: danh mục chính */}
                <div className="w-1/2 border-r">
                  {Object.keys(categoryData).map((cat) => (
                    <div
                      key={cat}
                      className={`flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-red-100 ${
                        selectedMainCategory === cat ? 'bg-red-50 font-semibold' : ''
                      }`}
                      onMouseEnter={() => setSelectedMainCategory(cat)}
                    >
                      {cat === 'Sách' && <LibraryBig className="h-4 w-4 text-[rgb(201,33,39)]" />}
                      {cat === 'Văn phòng phẩm' && <PencilRuler className="h-4 w-4 text-[rgb(201,33,39)]" />}
                      {cat}
                    </div>
                  ))}
                </div>

                {/* Cột 2: danh mục phụ */}
                <div className="w-1/2 p-4">
                  {categoryData[selectedMainCategory].map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex cursor-pointer px-2 py-1 text-sm hover:text-red-800"
                      onClick={() => handleCategoryClick(selectedMainCategory, idx)}
                    >
                      <Dot className="h-6 w-6 text-[rgb(201,33,39)]" />
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>{' '}
          <div className="mx-4 max-w-2xl flex-1 pr-4">
            <form onSubmit={handleSearch} className="relative flex">
              <Input
                type="text"
                placeholder="Tìm kiếm sách, văn phòng phẩm..."
                value={inputValue}
                onChange={handleSearchInputChange}
                className="flex-1 border-gray-300 pr-12 focus:border-red-500 focus:ring-red-500"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute top-0 right-0 h-full rounded-l-none bg-[rgb(201,33,39)] px-4 text-white hover:bg-red-600"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
          <div className="flex items-center space-x-2">
            {' '}
            {currentUser ? (
              <>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
                <CartIcon />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-12">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            currentUser.avatar ||
                            'https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg'
                          }
                          alt={currentUser.userName}
                        />
                        {/* <AvatarFallback>JD</AvatarFallback> */}
                      </Avatar>
                      <p className="text-base font-medium">{currentUser.userName}</p>
                    </Button>
                    {/* <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{currentUser.userName}</span>
                    </Button> */}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-55">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-base leading-none font-medium">{currentUser.userName}</p>
                        <p className="text-muted-foreground text-ms leading-none">{currentUser.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfile}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Thông tin cá nhân</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile/orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>Đơn hàng của tôi</span>
                    </DropdownMenuItem>
                    {(currentUser.role === 'ADMIN' || currentUser.role === 'STAFF') && (
                      <>
                        <DropdownMenuItem onClick={handleAdminAccess}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Truy cập Admin</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:bg-red-600 focus:text-white"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4 focus:text-white" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleLogin} className="text-sm">
                  Đăng nhập
                </Button>
                <Button
                  size="sm"
                  onClick={handleRegister}
                  className="bg-red-500 text-sm text-white hover:bg-red-600"
                >
                  Đăng ký
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between py-2 md:hidden">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Menu className="h-4 w-4" />
            <span className="text-sm">Danh mục</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
