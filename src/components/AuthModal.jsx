import { useState } from 'react'
import { authService } from '../utils/supabase'
import './AuthModal.css'

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('请填写所有必填字段')
      return false
    }

    if (!isLogin) {
      if (!formData.username) {
        setError('请输入用户名')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('两次输入的密码不一致')
        return false
      }
      if (formData.password.length < 6) {
        setError('密码长度至少6位')
        return false
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      let result
      if (isLogin) {
        result = await authService.signIn(formData.email, formData.password)
      } else {
        result = await authService.signUp(formData.email, formData.password, formData.username)
      }

      if (result.error) {
        if (result.error.message.includes('Invalid login credentials')) {
          setError('邮箱或密码错误')
        } else if (result.error.message.includes('User already registered')) {
          setError('该邮箱已被注册')
        } else if (result.error.message.includes('Password should be at least 6 characters')) {
          setError('密码长度至少6位')
        } else {
          setError(result.error.message)
        }
      } else {
        if (!isLogin) {
          setError('')
          alert('注册成功！请检查邮箱进行验证。')
        } else {
          onAuthSuccess(result.data.user)
          onClose()
        }
      }
    } catch (err) {
      setError('操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      username: '',
      confirmPassword: ''
    })
    setError('')
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  if (!isOpen) return null

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>{isLogin ? '登录' : '注册'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">用户名</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="请输入用户名"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="请输入邮箱地址"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="请输入密码"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="请再次输入密码"
                required={!isLogin}
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? '还没有账号？' : '已有账号？'}
            <button 
              type="button" 
              className="switch-button"
              onClick={switchMode}
            >
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthModal