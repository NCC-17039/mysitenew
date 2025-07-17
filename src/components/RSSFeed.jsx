import { useState, useEffect } from 'react'
import './RSSFeed.css'

const RSSFeed = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRSS = async () => {
      try {
        setLoading(true)
        // 使用CORS代理服务获取RSS
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent('https://b.ncc17039.eu.org/rss.xml')}`)
        const data = await response.json()
        
        // 解析XML
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml')
        const items = xmlDoc.querySelectorAll('item')
        
        const parsedArticles = Array.from(items).slice(0, 5).map(item => ({
          title: item.querySelector('title')?.textContent || '无标题',
          link: item.querySelector('link')?.textContent || '#',
          description: item.querySelector('description')?.textContent?.replace(/<[^>]*>/g, '').substring(0, 150) + '...' || '暂无描述',
          pubDate: new Date(item.querySelector('pubDate')?.textContent || Date.now()).toLocaleDateString('zh-CN'),
          category: item.querySelector('category')?.textContent || '未分类'
        }))
        
        setArticles(parsedArticles)
        setError(null)
      } catch (err) {
        console.error('获取RSS失败:', err)
        setError('无法加载最新文章')
        // 设置默认文章
        setArticles([
          {
            title: '欢迎访问我的博客',
            link: 'https://b.ncc17039.eu.org/',
            description: '这里记录着我的思考、学习和生活点滴，欢迎来访...',
            pubDate: new Date().toLocaleDateString('zh-CN'),
            category: '公告'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchRSS()
    
    // 每5分钟更新一次
    const interval = setInterval(fetchRSS, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="rss-feed">
        <div className="rss-header">
          <h4>📰 最新文章</h4>
          <div className="rss-status loading">加载中...</div>
        </div>
        <div className="rss-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="rss-feed">
      <div className="rss-header">
        <h4>📰 最新文章</h4>
        <div className="rss-status">
          {error ? (
            <span className="error">⚠️ {error}</span>
          ) : (
            <span className="success">🔄 实时更新</span>
          )}
        </div>
      </div>
      
      <div className="rss-articles">
        {articles.map((article, index) => (
          <a 
            key={index}
            href={article.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="rss-article"
          >
            <div className="article-header">
              <h5 className="article-title">{article.title}</h5>
              <span className="article-category">{article.category}</span>
            </div>
            <p className="article-description">{article.description}</p>
            <div className="article-footer">
              <span className="article-date">📅 {article.pubDate}</span>
              <span className="read-more">阅读更多 →</span>
            </div>
          </a>
        ))}
      </div>
      
      <div className="rss-footer">
        <a 
          href="https://b.ncc17039.eu.org/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="view-all-btn"
        >
          查看所有文章 🚀
        </a>
      </div>
    </div>
  )
}

export default RSSFeed