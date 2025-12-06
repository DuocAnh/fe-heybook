import { Bell, MessageCircleMore, Search, Settings, User, LogOut } from 'lucide-react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUserAPI, selectCurrentUser } from '@/redux/userSlice'

export default function HeaderDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const currentUser = useSelector(selectCurrentUser)

  const handleAdminAccess = () => {
    navigate('/')
  }

  const handleLogout = async () => {
    try {
      await dispatch(logoutUserAPI()).unwrap()
      navigate('/login')
    } catch {
      // Handle logout error if needed
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-15 shrink-0 items-center justify-between border-b border-gray-300 bg-white px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <div className="relative max-w-md">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Tìm kiếm..."
            className="bg-background w-full rounded-md border pl-8 md:w-[200px] lg:w-[300px]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" className="flex h-12 w-12 items-center justify-center rounded-full">
          <MessageCircleMore className="size-5" size="32" />
          <span className="sr-only">Messenger</span>
        </Button>
        <Button variant="ghost" className="flex h-12 w-12 items-center justify-center rounded-full">
          <Bell className="size-5" size="32" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <DropdownMenu>
          {/* Trigger */}
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-12">
              <Avatar className="h-10 w-10">
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
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 px-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-base leading-none font-medium">{currentUser.userName}</p>
                <p className="text-muted-foreground text-ms leading-none">{currentUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Thông tin cá nhân</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAdminAccess}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Truy cập trang chủ</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-600 focus:text-white"
              onClick={() => handleLogout()}
            >
              <LogOut className="focus:bg-red-500 focus:text-amber-50" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
