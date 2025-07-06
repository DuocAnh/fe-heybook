import { Search, Bell, User, ChevronDown, Menu, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CartIcon from '@/components/CartIcon'
import { getCategoriesForProductAPI, getBookGenresForProductAPI } from '@/apis'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState("Sách");
  const categoryMenuRef = useRef(null);
  const [categories, setCategories] = useState([])
  const [bookGenres, setBookGenres] = useState([])

  const categoryData = useMemo(() => ({
    "Sách": bookGenres.map(genre => genre.name),
    "Văn phòng phẩm": categories.map(cat => cat.name)

  }), [categories, bookGenres])

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
        setShowCategoryMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
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
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
                <span className="text-sm font-bold text-white"></span>
              </div>
              <span className="text-xl font-bold text-red-500">HeyBook.com</span>
            </Link>
          </div>
          <div ref={categoryMenuRef} className="ml-3 hidden items-center md:flex relative">
            <Button variant="outline"
              className="flex items-center space-x-2 border-gray-300"
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            >
              <Menu className="h-4 w-4" />
              <span className="text-sm">Danh mục</span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* Dropdown hiển thị 2 cột */}
            {showCategoryMenu && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-white border rounded shadow-lg flex w-[480px]">
                {/* Cột 1: danh mục chính */}
                <div className="w-1/2 border-r">
                  {Object.keys(categoryData).map((cat) => (
                    <div
                      key={cat}
                      className={`px-4 py-2 cursor-pointer hover:bg-red-100 ${selectedMainCategory === cat ? "bg-red-50 font-semibold" : ""
                        }`}
                      onMouseEnter={() => setSelectedMainCategory(cat)}
                    >
                      {cat}
                    </div>
                  ))}
                </div>

                {/* Cột 2: danh mục phụ */}
                <div className="w-1/2 p-4">
                  {categoryData[selectedMainCategory].map((sub, idx) => (
                    <div
                      key={idx}
                      className="py-1 px-2 hover:text-red-600 cursor-pointer text-sm"
                      onClick={() => handleCategoryClick(selectedMainCategory, idx)}
                    >
                      {sub}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>{' '}
          <div className="mx-4 max-w-2xl flex-1">
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
                className="absolute top-0 right-0 h-full rounded-l-none bg-red-500 px-4 text-white hover:bg-red-600"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
          <div className="flex items-center space-x-4">
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
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{currentUser.userName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleProfile}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Thông tin cá nhân</span>
                    </DropdownMenuItem>
                    {(currentUser.role === 'ADMIN' || currentUser.role === 'USER') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleAdminAccess}>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Truy cập Admin</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:bg-red-500 focus:text-white"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
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
