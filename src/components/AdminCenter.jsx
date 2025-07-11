import { useState, useEffect } from 'react'
import { authService } from '../utils/supabase'
import './AdminCenter.css'

const AdminCenter = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [siteContent, setSiteContent] = useState({})
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    switch (activeTab) {
      case 'users':
        loadUsers()
        break
      case 'content':
        loadSiteContent()
        break
      case 'activities':
        loadAllActivities()
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

  const loadSiteContent = async () => {
    setLoading(true)
    try {
      const { data, error } = await authService.getSiteContent()
      if (error) throw error
      
      // 将数组转换为按section分组的对象
      const contentBySection = {}
      data?.forEach(item => {
        if (!contentBySection[item.section]) {
          contentBySection[item.section] = {}
        }
        contentBySection[item.section][item.content_key] = item.content_value
      })
      setSiteContent(contentBySection)
    } catch (err) {
      setError('加载网站内容失败')
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

  const handleContentUpdate = async (section, key, value) => {
    try {
      const { error } = await authService.updateSiteContent(section, key, value, user.id)
      if (error) throw error
      
      setSuccess('内容更新成功！')
      setTimeout(() => setSuccess(''), 3000)
      
      // 重新加载内容
      loadSiteContent()
    } catch (err) {
      setError('更新失败: ' + err.message)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('确定要删除这个用户吗？此操作不可恢复！')) return
    
    try {
      const { error } = await authService.deleteUser(userId)
      if (error) throw error
      
      setSuccess('用户删除成功！')
      loadUsers()
    } catch (err) {
      setError('删除用户失败: ' + err.message)
    }
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
      default: return '📋'
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
                    <div className="stat-number">{Object.keys(siteContent).length}</div>
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
                      </div>
                      <div className="user-actions">
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
                  {Object.entries(siteContent).map(([section, content]) => (
                    <div key={section} className="content-section">
                      <h4>{section.toUpperCase()} 页面</h4>
                      {Object.entries(content).map(([key, value]) => (
                        <div key={key} className="content-item">
                          <label>{key}:</label>
                          {typeof value === 'string' ? (
                            <input
                              type="text"
                              value={value.replace(/"/g, '')}
                              onChange={(e) => handleContentUpdate(section, key, `"${e.target.value}"`)}
                            />
                          ) : (
                            <textarea
                              value={JSON.stringify(value, null, 2)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value)
                                  handleContentUpdate(section, key, parsed)
                                } catch (err) {
                                  // 忽略JSON解析错误，用户还在编辑中
                                }
                              }}
                              rows="6"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
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
                          <strong>{activity.user_email}</strong> {activity.activity_type}
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
        </div>
      </div>
    </div>
  )
}

export default AdminCenter