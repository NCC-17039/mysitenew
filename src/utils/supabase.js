import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 用户认证相关函数
export const authService = {
  // 注册
  async signUp(email, password, username) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      })
      
      if (error) throw error
      
      // 如果注册成功，创建用户资料
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: data.user.id,
              username: username,
              email: email,
              created_at: new Date().toISOString()
            }
          ])
        
        if (profileError) {
          console.error('创建用户资料失败:', profileError)
        }

        // 记录注册活动
        await this.logUserActivity(data.user.id, 'register', {
          username: username,
          email: email
        })
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 登录
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // 记录登录活动
      if (data.user) {
        await this.logUserActivity(data.user.id, 'login', {
          email: email
        })
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 登出
  async signOut() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
       
       // 记录登出活动
       if (user) {
         await this.logUserActivity(user.id, 'logout', {})
       }
       
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  // 获取当前用户
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      return { user: null, error }
    }
  },

  // 获取用户资料
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 更新用户资料
  async updateUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 记录用户活动
  async logUserActivity(userId, activityType, activityData = {}) {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert([
          {
            user_id: userId,
            activity_type: activityType,
            activity_data: activityData,
            created_at: new Date().toISOString()
          }
        ])
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('记录用户活动失败:', error)
      return { error }
    }
  },

  // 获取用户活动日志
  async getUserActivities(userId) {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 检查是否为管理员
  async isAdmin(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { isAdmin: false, adminData: null, error: null }
      
      // 直接检查邮箱是否为管理员邮箱
      const isAdminEmail = user.email === 'mygalaxycn@qq.com'
      
      if (isAdminEmail) {
        // 获取管理员数据
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('email', user.email)
          .single()
        
        return { isAdmin: true, adminData: data, error: null }
      }
      
      return { isAdmin: false, adminData: null, error: null }
    } catch (error) {
      return { isAdmin: false, adminData: null, error }
    }
  },

  // 管理员功能 - 获取所有用户
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 管理员功能 - 获取网站内容
  async getSiteContent() {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('section', { ascending: true })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 管理员功能 - 更新网站内容
  async updateSiteContent(section, contentKey, contentValue, updatedBy) {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .upsert({
          section,
          content_key: contentKey,
          content_value: contentValue,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .select()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 管理员功能 - 获取所有活动日志
  async getAllActivities() {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          *,
          user_profiles!inner(email)
        `)
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (error) throw error
      
      // 格式化数据，添加用户邮箱
      const formattedData = data?.map(activity => ({
        ...activity,
        user_email: activity.user_profiles?.email || '未知用户'
      }))
      
      return { data: formattedData, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 管理员功能 - 获取统计数据
  async getAdminStats() {
    try {
      const [usersResult, activitiesResult] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact' }),
        supabase.from('user_activities').select('id', { count: 'exact' })
      ])
      
      const stats = {
        total_users: usersResult.count || 0,
        total_activities: activitiesResult.count || 0,
        active_sessions: 0, // 这个需要更复杂的查询
      }
      
      return { data: stats, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // 管理员功能 - 删除用户
  async deleteUser(userId) {
    try {
      // 先删除用户资料（会级联删除相关数据）
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)
      
      if (profileError) throw profileError
      
      return { error: null }
    } catch (error) {
      return { error }
    }
  }
}