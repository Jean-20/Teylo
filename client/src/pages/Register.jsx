import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { register as registerApi } from '../api/auth.js'
import useAuthStore from '../store/authStore.js'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      return setError('Las contraseñas no coinciden')
    }
    if (form.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres')
    }

    setLoading(true)
    try {
      const { data } = await registerApi(form.name, form.email, form.password)
      login(data.data.user, data.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-200 via-purple-300 to-purple-500 flex-col justify-center p-14">
        <h2 className="text-4xl font-bold text-primary leading-tight mb-4">
          Escribe,<br />colorea y<br />organiza.
        </h2>
        <p className="text-gray-carbon text-sm leading-relaxed max-w-sm">
          Únete a miles de estudiantes y creativos que confían en Teylo para sus útiles escolares, de oficina y arte.
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white-paper">
        <div className="w-full max-w-md">
          <span className="text-primary font-bold text-lg block mb-1">Teylo</span>
          <h1 className="text-2xl font-bold text-gray-carbon mb-1">Crear una cuenta</h1>
          <p className="text-sm text-gray-400 mb-7">Accede a los mejores útiles de librería en un solo lugar.</p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-carbon mb-1.5">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Tu nombre"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-soft rounded text-sm focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="block text-sm font-medium text-gray-carbon mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="ejemplo@correo.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-soft rounded text-sm focus:outline-none focus:border-primary transition"
                />
              </div>
            </div>

            {/* Contraseñas en 2 columnas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-carbon mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-8 py-2.5 border border-gray-soft rounded text-sm focus:outline-none focus:border-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-carbon mb-1.5">
                  Confirmar
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={set('confirm')}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-8 py-2.5 border border-gray-soft rounded text-sm focus:outline-none focus:border-primary transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded font-medium hover:bg-purple-700 transition disabled:opacity-60"
            >
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-gray-soft" />
            <span className="px-3 text-xs text-gray-400">o</span>
            <div className="flex-1 border-t border-gray-soft" />
          </div>

          {/* Social (solo UI) */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 border border-gray-soft rounded py-2.5 text-sm text-gray-carbon hover:bg-gray-soft transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-soft rounded py-2.5 text-sm text-gray-carbon hover:bg-gray-soft transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.701z"/>
              </svg>
              Apple
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>

          <p className="text-center text-xs text-gray-300 mt-3">
            Al registrarte aceptas nuestros Términos de Servicio y Política de Privacidad. © 2025 Teylo.
          </p>
        </div>
      </div>
    </div>
  )
}
