import { useState, useEffect } from 'react'
import { authService } from '../utils/supabase'
import './UserCenter.css'

const UserCenter = ({ user, userProfile, onClose, onProfileUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    username: userProfile?.username || '',
    email: user?.email || '',
    bio: userProfile?.bio || '',
    avatar_url: userProfile?.avatar_url || ''
  })
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 加载用户活动日志
  useEffect(() => {
    if (activeTab === 'activities') {
      loadUserActivities()
    }
  }, [activeTab])

  const loadUserActivities = async () => {
    try {
      if (!user?.id) return
      
      const { data, error } = await authService.getUserActivities(user.id)
      if (error) throw error
      setActivities(data || [])
    } catch (err) {
      console.error('加载活动日志失败:', err)
      setActivities([])
    }
  }

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
    setError('')
    setSuccess('')
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await authService.updateUserProfile(user.id, {
        username: profileData.username,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url
      })

      if (error) throw error

      setSuccess('个人资料更新成功！')
      onProfileUpdate()
      
      // 记录活动日志
      await authService.logUserActivity(user.id, 'profile_update', {
        updated_fields: ['username', 'bio', 'avatar_url']
      })
    } catch (err) {
      setError(err.message || '更新失败，请重试')
    } finally {
      setLoading(false)
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

  const getActivityText = (type) => {
    switch (type) {
      case 'login': return '登录系统'
      case 'logout': return '退出系统'
      case 'register': return '注册账号'
      case 'profile_update': return '更新个人资料'
      default: return '未知活动'
    }
  }

  return (
    <div className="user-center-overlay" onClick={onClose}>
      <div className="user-center" onClick={(e) => e.stopPropagation()}>
        <div className="user-center-header">
          <h2>个人中心</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="user-center-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 个人资料
          </button>
          <button 
            className={`tab-button ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            📊 活动记录
          </button>
        </div>

        <div className="user-center-content">
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <div className="profile-header">
                <div className="profile-avatar">
                  {profileData.avatar_url ? (
                    <img src={profileData.avatar_url} alt="头像" />
                  ) : (
                    <div className="avatar-placeholder">
                      {profileData.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="profile-info">
                  <h3>{profileData.username || '未设置用户名'}</h3>
                  <p>{user.email}</p>
                  <span className="join-date">
                    加入时间: {formatDate(user.created_at)}
                  </span>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label htmlFor="username">用户名</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profileData.username}
                    onChange={handleInputChange}
                    placeholder="请输入用户名"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">邮箱（不可修改）</label>
                  <input
                    type="email"
                    id="email"
                    value={profileData.email}
                    disabled
                    className="disabled-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">个人简介</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    placeholder="介绍一下自己吧..."
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="avatar_url">头像链接</label>
                  <input
                    type="url"
                    id="avatar_url"
                    name="avatar_url"
                    value={profileData.avatar_url}
                    onChange={handleInputChange}
                    placeholder="请输入头像图片链接"
                  />
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button 
                  type="submit" 
                  className="update-button"
                  disabled={loading}
                >
                  {loading ? '更新中...' : '更新资料'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="activities-tab">
              <h3>最近活动</h3>
              <div className="activities-list">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="activity-details">
                        <div className="activity-text">
                          {getActivityText(activity.activity_type)}
                        </div>
                        <div className="activity-time">
                          {formatDate(activity.created_at)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-activities">
                    <p>暂无活动记录</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserCenter