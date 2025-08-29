import { useState, useEffect } from 'react'
import { Bell, User, LogOut, Home, Palette, Package, Users, Settings, FileText, TrendingUp, TrendingDown, Minus, Menu, X, AlertTriangle, Box, ArrowUpDown, History, Plus, ArrowDownLeft, Globe } from 'lucide-react'
import ProductsManagement from '../Products/ProductList'
import UserList from '../Users/UserList'
import MovementList from '../Movements/MovementList'
import Kardex from '../Movements/Kardex'
import ReportsContainer from '../Reports/ReportsContainer'
import SettingsPage from '../Settings/Settings'
import ThemeManagement from '../Themes/ThemeManagement'
import LanguageManagement from '../Languages/LanguageManagement'
import { UserProvider } from '../../contexts/UserContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useTranslation } from '../../hooks/useTranslation'

const Card = ({ children, className = "" }) => (
  <div className={`theme-card rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
)

const CardContent = ({ children }) => (
  <div className="p-6">
    {children}
  </div>
)

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`theme-text-primary ${className}`}>
    {children}
  </h3>
)

const Button = ({ children, variant = "default", size = "default", className = "", onClick, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
  
  const variants = {
    default: "btn-theme-primary",
    ghost: "theme-text-secondary hover:theme-bg-secondary",
    danger: "badge-danger hover:opacity-90",
  }
  
  const sizes = {
    default: "h-10 py-2 px-4",
    icon: "h-10 w-10",
  }
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

const StatCard = ({ title, value, subtitle, trend, trendValue, icon }) => {
  const trendConfig = {
    up: { color: 'badge-success', icon: <TrendingUp className="w-4 h-4" /> },
    down: { color: 'badge-danger', icon: <TrendingDown className="w-4 h-4" /> },
    neutral: { color: 'badge-info', icon: <Minus className="w-4 h-4" /> }
  }

  return (
    <Card className="group relative overflow-hidden theme-card-hover cursor-pointer">
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: 'var(--color-primary-light)' }}></div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium theme-text-secondary">{title}</CardTitle>
          <div className="p-2.5 rounded-lg transition-colors" style={{ backgroundColor: 'var(--color-primary-light)' }}>
            <div className="transition-colors" style={{ color: 'var(--color-primary)' }}>{icon}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold theme-text-primary mb-2">{value}</div>
        <p className="text-sm theme-text-secondary mb-3">{subtitle}</p>
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trendConfig[trend].color}`}>
          {trendConfig[trend].icon}
          <span className="ml-1">{trendValue}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Modal de confirmación personalizado
const LogoutModal = ({ isOpen, onClose, onConfirm, userName }) => {
  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          onClose()
        } else if (event.key === 'Enter') {
          onConfirm()
        }
      }
      
      document.addEventListener('keydown', handleKeyDown)
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, onClose, onConfirm])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-in fade-in duration-200" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl theme-card px-4 pb-4 pt-5 text-left shadow-xl transition-all animate-in zoom-in-95 duration-300 sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          {/* Header con icono de advertencia */}
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10" style={{ backgroundColor: 'var(--color-primary-light)' }}>
              <AlertTriangle className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
              <h3 className="text-lg font-semibold leading-6 theme-text-primary">
                Cerrar Sesion
              </h3>
              <div className="mt-2">
                <p className="text-sm theme-text-secondary mb-3">
                  ¿Estas seguro que deseas cerrar sesion{userName ? `, ${userName}` : ''}? 
                  Seras redirigido a la pagina de inicio de sesion y deberas autenticarte nuevamente.
                </p>
                <div className="text-xs theme-text-tertiary theme-bg-secondary rounded-lg p-2">
                  💡 <span className="font-medium">Tip:</span> Presiona <kbd className="px-1 py-0.5 theme-bg-primary rounded theme-border font-mono text-xs">Esc</kbd> para cancelar o <kbd className="px-1 py-0.5 theme-bg-primary rounded theme-border font-mono text-xs">Enter</kbd> para confirmar
                </div>
              </div>
            </div>
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 theme-text-tertiary hover:theme-text-secondary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Botones de acción */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <Button
              variant="danger"
              onClick={onConfirm}
              className="w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Si, Cerrar Sesion
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="mt-3 w-full sm:mt-0 sm:w-auto"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MuestrasUnivarDashboard({ user, onLogout }) {
  // Usuario comercial va directamente a reportes, otros al dashboard
  const [activeNav, setActiveNav] = useState(user?.role === 'commercial' ? 'reports' : 'dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  
  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false)
    if (onLogout) {
      onLogout()
    }
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  const navItems = [
    { id: 'dashboard', label: t('navigation.dashboard'), icon: <Home className="w-5 h-5" />, roles: ['administrador', 'admin', 'user'] },
    { id: 'themes', label: t('navigation.themes'), icon: <Palette className="w-5 h-5" />, roles: ['administrador', 'admin', 'user'] },
    { id: 'languages', label: t('navigation.languages'), icon: <Globe className="w-5 h-5" />, roles: ['administrador', 'admin', 'user'] },
    { id: 'products', label: t('navigation.products'), icon: <Box className="w-5 h-5" />, roles: ['administrador', 'admin', 'user'] },
    { id: 'movements', label: t('navigation.movements'), icon: <ArrowUpDown className="w-5 h-5" />, roles: ['administrador', 'admin', 'user'] },
    { id: 'kardex', label: t('navigation.kardex'), icon: <History className="w-5 h-5" />, roles: ['administrador', 'admin', 'user'] },
    { id: 'users', label: t('navigation.users'), icon: <Users className="w-5 h-5" />, roles: ['administrador', 'admin'] },
    { id: 'reports', label: t('navigation.reports'), icon: <FileText className="w-5 h-5" />, roles: ['administrador', 'admin', 'user', 'commercial'] },
    { id: 'settings', label: t('navigation.settings'), icon: <Settings className="w-5 h-5" />, roles: ['administrador', 'admin'] }
  ]

  const stats = [
    {
      title: 'Total Productos',
      value: '1,234',
      subtitle: 'Productos registrados en el sistema',
      trend: 'up',
      trendValue: '+12% vs mes anterior',
      icon: <Package className="w-5 h-5" />
    },
    {
      title: 'Entradas del Mes',
      value: '89',
      subtitle: 'Movimientos de entrada registrados',
      trend: 'up',
      trendValue: '+5% este mes',
      icon: <Plus className="w-5 h-5" />
    },
    {
      title: 'Salidas del Mes',
      value: '76',
      subtitle: 'Movimientos de salida registrados',
      trend: 'down',
      trendValue: '-3% vs mes anterior',
      icon: <ArrowDownLeft className="w-5 h-5" />
    },
    {
      title: 'Movimientos Total',
      value: '324',
      subtitle: 'Movimientos de inventario este mes',
      trend: 'up',
      trendValue: '+8% vs mes anterior',
      icon: <ArrowUpDown className="w-5 h-5" />
    }
  ]

  return (
    <UserProvider user={user}>
      <div className={`min-h-screen theme-bg-secondary ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Bar */}
      <header className="theme-bg-primary theme-border px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="theme-text-secondary"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{ '--hover-color': 'var(--color-primary)' }}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold theme-text-primary">Muestras Univar</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="theme-text-secondary">
              <Bell className="w-5 h-5" />
            </Button>
            <div 
              className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:theme-bg-secondary transition-colors cursor-pointer"
              title={user ? `${user.email} • ${user.country || 'Sin pais asignado'}` : 'Informacion de usuario'}
            >
              <User className="w-5 h-5 theme-text-secondary" />
              <div className="text-sm">
                <div className="theme-text-primary font-medium">
                  {user ? `${user.first_name} ${user.last_name}` : 'Usuario'}
                </div>
                <div className="text-xs theme-text-secondary">
                  {user ? user.role : 'Rol no definido'}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="theme-text-secondary"
              onClick={handleLogoutClick}
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Collapsible Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} theme-bg-primary theme-border border-r min-h-screen transition-all duration-300`}>
          <nav className="p-2 space-y-1">
            {navItems
              .filter(item => !item.roles || item.roles.includes(user?.role))
              .map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group ${
                  activeNav === item.id
                    ? 'nav-item-active'
                    : 'theme-text-primary nav-item'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className={activeNav === item.id ? '' : 'theme-text-secondary'} style={activeNav === item.id ? { color: 'var(--color-primary)' } : {}}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {activeNav === 'themes' && (user?.role === 'administrador' || user?.role === 'admin' || user?.role === 'user') ? (
            <ThemeManagement />
          ) : activeNav === 'languages' && (user?.role === 'administrador' || user?.role === 'admin' || user?.role === 'user') ? (
            <LanguageManagement />
          ) : activeNav === 'products' && (user?.role === 'administrador' || user?.role === 'admin' || user?.role === 'user') ? (
            <ProductsManagement />
          ) : activeNav === 'movements' && (user?.role === 'administrador' || user?.role === 'admin' || user?.role === 'user') ? (
            <div className="p-6">
              <MovementList />
            </div>
          ) : activeNav === 'kardex' && (user?.role === 'administrador' || user?.role === 'admin' || user?.role === 'user') ? (
            <div className="p-6">
              <Kardex />
            </div>
          ) : activeNav === 'users' && (user?.role === 'administrador' || user?.role === 'admin') ? (
            <UserList />
          ) : activeNav === 'reports' && (user?.role === 'administrador' || user?.role === 'admin' || user?.role === 'user' || user?.role === 'commercial') ? (
            <ReportsContainer />
          ) : activeNav === 'settings' && (user?.role === 'administrador' || user?.role === 'admin') ? (
            <SettingsPage />)
          ) : (
            <div className="p-6">
              <div className="max-w-7xl mx-auto">
                {user?.role === 'commercial' ? (
                  // Redirigir usuarios comerciales a reportes
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
                    <h2 className="text-2xl font-bold theme-text-primary mb-2">Panel Comercial</h2>
                    <p className="theme-text-secondary mb-6">
                      Hola <span className="font-medium">{user.first_name}</span>, haz clic en "Reportes" para ver tus datos.
                    </p>
                    <button
                      onClick={() => setActiveNav('reports')}
                      className="btn-theme-primary px-6 py-3 rounded-lg font-medium"
                    >
                      Ir a Reportes
                    </button>
                  </div>
                ) : (
                  // Dashboard normal para admin y user
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold theme-text-primary">Dashboard</h2>
                      {user && (
                        <p className="theme-text-secondary mt-1">
                          Bienvenido de nuevo, <span className="font-medium">{user.first_name}</span>
                        </p>
                      )}
                    </div>
                    
                    {/* Enhanced Stats Cards with Orange Accents */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal de confirmación de logout */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        userName={user?.first_name}
      />
      </div>
    </UserProvider>
  )
}