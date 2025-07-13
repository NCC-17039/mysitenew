import { useState, useEffect } from 'react'
import { authService } from '../utils/supabase'
import './AdminCenter.css'

const AdminCenter = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [siteConfig, setSiteConfig] = useState({})
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingContent, setEditingContent] = useState({})

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    switch (activeTab) {
      case 'users':
        loadUsers()
        break
      case 'content':
        loadSiteConfig()
        break
      case 'activities':
        loadAllActivities()
        break
      case 'settings':
        loadSiteConfig()
        break
      default:
        break
    }
  }, [activeTab])

  const loadDashboardData = async () => {
    try {
      const { data: statsData } = await authService.getAdminStats()
      setStats(statsData || {})
    } catch (err) {
      console.error('加载统计数据失败:', err)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await authService.getAllUsers()
      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      setError('加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const loadSiteConfig = async () => {
    setLoading(true)
    try {
      const { data, error } = await authService.getSiteConfig()
      if (error) throw error
      setSiteConfig(data || {})
      setEditingContent(JSON.parse(JSON.stringify(data || {})))
    } catch (err) {
      setError('加载网站配置失败')
    } finally {
      setLoading(false)
    }
  }

  const loadAllActivities = async () => {
    setLoading(true)
    try {
      const { data, error } = await authService.getAllActivities()
      if (error) throw error
      setActivities(data || [])
    } catch (err) {
      setError('加载活动日志失败')
    } finally {
      setLoading(false)
    }
  }

  const handleContentChange = (section, key, value) => {
    setEditingContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const handleSaveContent = async (section) => {
    try {
      const sectionData = editingContent[section]
      if (!sectionData) return

      const updates = Object.entries(sectionData).map(([key, value]) => ({
        section,
        contentKey: key,
        contentValue: value
      }))

      const { error } = await authService.batchUpdateSiteContent(updates, user.id)
      if (error) throw error
      
      setSuccess(`${section.toUpperCase()} 页面内容更新成功！`)
      setTimeout(() => setSuccess(''), 3000)
      
      // 更新本地状态
      setSiteConfig(prev => ({
        ...prev,
        [section]: sectionData
      }))
    } catch (err) {
      setError('更新失败: ' + err.message)
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('确定要删除这个用户吗？此操作不可恢复！')) return
    
    try {
      const { error } = await authService.deleteUser(userId)
      if (error) throw error
      
      setSuccess('用户删除成功！')
      setTimeout(() => setSuccess(''), 3000)
      loadUsers()
    } catch (err) {
      setError('删除用户失败: ' + err.message)
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleSendNotification = async (userId) => {
    const message = prompt('请输入要发送的通知消息:')
    if (!message) return

    try {
      const { error } = await authService.sendSystemNotification(userId, message)
      if (error) throw error
      
      setSuccess('通知发送成功！')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('发送通知失败: ' + err.message)
      setTimeout(() => setError(''), 5000)
    }
  }

  const renderContentEditor = (section, data) => {
    if (!data) return null

    return (
      <div className="content-section">
        <div className="content-section-header">
          <h4>{section.toUpperCase()} 页面配置</h4>
          <button 
            className="save-button"
            onClick={() => handleSaveContent(section)}
          >
            保存更改
          </button>
        </div>
        
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="content-item">
            <label>{key.replace(/_/g, ' ').toUpperCase()}:</label>
            {typeof value === 'string' ? (
              value.length > 100 ? (
                <textarea
                  value={value.replace(/^"|"$/g, '')}
                  onChange={(e) => handleContentChange(section, key, `"${e.target.value}"`)}
                  rows="3"
                />
              ) : (
                <input
                  type="text"
                  value={value.replace(/^"|"$/g, '')}
                  onChange={(e) => handleContentChange(section, key, `"${e.target.value}"`)}
                />
              )
            ) : (
              <textarea
                value={JSON.stringify(value, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    handleContentChange(section, key, parsed)
                  } catch (err) {
                    // 忽略JSON解析错误，用户还在编辑中
                  }
                }}
                rows="8"
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return '🔐'
      case 'logout': return '🚪'
      case 'register': return '📝'
      case 'profile_update': return '✏️'
      case 'system_notification': return '📢'
      default: return '📋'
    }
  }

  const getActivityText = (type) => {
    switch (type) {
      case 'login': return '登录系统'
      case 'logout': return '退出系统'
      case 'register': return '注册账号'
      case 'profile_update': return '更新个人资料'
      case 'system_notification': return '收到系统通知'
      default: return '未知活动'
    }
  }

  return (
    <div className="admin-center-overlay" onClick={onClose}>
      <div className="admin-center" onClick={(e) => e.stopPropagation()}>
        <div className="admin-center-header">
          <h2>🛡️ 管理员控制台</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="admin-center-tabs">
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 仪表板
          </button>
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 用户管理
          </button>
          <button 
            className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            📝 内容管理
          </button>
          <button 
            className={`tab-button ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            📋 活动日志
          </button>
          <button 
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ 系统设置
          </button>
        </div>

        <div className="admin-center-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {activeTab === 'dashboard' && (
            <div className="dashboard-tab">
              <h3>系统概览</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <div className="stat-number">{stats.total_users || 0}</div>
                    <div className="stat-label">总用户数</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔐</div>
                  <div className="stat-info">
                    <div className="stat-number">{stats.active_sessions || 0}</div>
                    <div className="stat-label">活跃会话</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <div className="stat-number">{stats.total_activities || 0}</div>
                    <div className="stat-label">总活动数</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🌐</div>
                  <div className="stat-info">
                    <div className="stat-number">{Object.keys(siteConfig).length}</div>
                    <div className="stat-label">内容模块</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-tab">
              <h3>用户管理</h3>
              {loading ? (
                <div className="loading">加载中...</div>
              ) : (
                <div className="users-list">
                  {users.map((user) => (
                    <div key={user.id} className="user-item">
                      <div className="user-avatar">
                        {user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.username || '未设置'}</div>
                        <div className="user-email">{user.email}</div>
                        <div className="user-date">注册: {formatDate(user.created_at)}</div>
                        {user.bio && <div className="user-bio">{user.bio}</div>}
                      </div>
                      <div className="user-actions">
                        <button 
                          className="notify-button"
                          onClick={() => handleSendNotification(user.id)}
                        >
                          发送通知
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'content' && (
            <div className="content-tab">
              <h3>网站内容管理</h3>
              {loading ? (
                <div className="loading">加载中...</div>
              ) : (
                <div className="content-sections">
                  {Object.entries(editingContent).map(([section, content]) => 
                    renderContentEditor(section, content)
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="activities-tab">
              <h3>全站活动日志</h3>
              {loading ? (
                <div className="loading">加载中...</div>
              ) : (
                <div className="activities-list">
                  {activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="activity-details">
                        <div className="activity-text">
                          <strong>{activity.user_email}</strong> {getActivityText(activity.activity_type)}
                          {activity.activity_data?.message && (
                            <div className="activity-message">
                              消息: {activity.activity_data.message}
                            </div>
                          )}
                        </div>
                        <div className="activity-time">
                          {formatDate(activity.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-tab">
              <h3>系统设置</h3>
              {loading ? (
                <div className="loading">加载中...</div>
              ) : (
                <div className="settings-sections">
                  <div className="settings-section">
                    <h4>🎨 主题配置</h4>
                    {siteConfig.site && renderContentEditor('site', siteConfig.site)}
                  </div>
                  
                  <div className="settings-section">
                    <h4>🔧 系统维护</h4>
                    <div className="maintenance-actions">
                      <button 
                        className="maintenance-button"
                        onClick={() => {
                          if (confirm('确定要清理所有活动日志吗？')) {
                            setSuccess('功能开发中...')
                          }
                        }}
                      >
                        清理活动日志
                      </button>
                      <button 
                        className="maintenance-button"
                        onClick={() => {
                          setSuccess('数据备份功能开发中...')
                        }}
                      >
                        备份数据
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminCenter