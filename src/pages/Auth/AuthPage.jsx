import { useLocation, Link } from 'react-router-dom'
import { GalleryVerticalEnd } from 'lucide-react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export default function AuthPage() {
  const location = useLocation()

  const isLogin = location.pathname === '/login'
  const isRegister = location.pathname === '/register'

  return (
    <div className="mt-15 flex min-h-screen w-full justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white px-6 md:max-w-lg">
        {/* Form area (centered) */}
        {isLogin && <LoginForm />}
        {isRegister && <RegisterForm />}
      </div>
    </div>
  )
}
