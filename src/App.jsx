import { useState } from 'react'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('home')

  const sections = {
    home: {
      title: '',
      content: (
        <div className="home-content">
          <h1 className="home-title">给生活以记录</h1>
        </div>
      )
    },
    about: {
      title: '关于我',
      content: (
        <div className="other-content">
          <div className="about-content">
            <div className="about-card">
              <h3>🏫 大学牲 | 白日梦患者</h3>
            </div>
            <div className="about-card">
              <h3>🌞 白日梦患者 | 不会拍照但摄影爱好者</h3>
            </div>
            <div className="about-card">
              <h3>💬 吐槽专家 | 星际迷航粉丝</h3>
            </div>
            
            <div className="idols-section">
              <h3>🎵 我的音乐偶像</h3>
              <p>这些艺术家的音乐陪伴我穿越星际，点燃创作灵感</p>
              <div className="idols-grid">
                <a href="https://thechainsmokers.com/" target="_blank" rel="noopener noreferrer" className="idol-card">
                  <div className="idol-icon">🎧</div>
                  <h4>THE CHAINSMOKERS</h4>
                  <p>电音界的传奇双人组</p>
                </a>
                <a href="https://alanwalker.com/" target="_blank" rel="noopener noreferrer" className="idol-card">
                  <div className="idol-icon">🎭</div>
                  <h4>ALAN WALKER</h4>
                  <p>神秘面具下的音乐天才</p>
                </a>
                <a href="https://www.worldofwalker.com/" target="_blank" rel="noopener noreferrer" className="idol-card">
                  <div className="idol-icon">🌍</div>
                  <h4>WALKERWORLD</h4>
                  <p>Walker宇宙的官方门户</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    },
    projects: {
      title: '我的项目',
      content: (
        <div className="other-content">
          <div className="projects-content">
            <a href="https://ps.ncc17039.eu.org/" target="_blank" rel="noopener noreferrer" className="project-card project-link-card">
              <div className="project-header">
                <h3>📸 NCC-17039 Photo System</h3>
                <span className="project-status completed">已部署</span>
              </div>
              <p>基于先进量子存储技术的星际图像管理系统，为银河系探索者提供高效的视觉数据归档与检索服务。采用分布式架构，确保在任何星系都能快速访问珍贵的宇宙影像。</p>
              <div className="project-tags">
                <span className="tag">Quantum Storage</span>
                <span className="tag">Neural Interface</span>
                <span className="tag">Holographic Display</span>
              </div>
            </a>
            
            <a href="https://b.ncc17039.eu.org/" target="_blank" rel="noopener noreferrer" className="project-card project-link-card">
              <div className="project-header">
                <h3>📝 个人博客</h3>
                <span className="project-status completed">已部署</span>
              </div>
              <p>运行在星际网络上的个人思维记录站点，采用超光速数据传输协议，实时同步来自银河系各个角落的见解与思考。集成了多维度内容展示引擎，让每一篇文章都能在时空中留下永恒的印记。</p>
              <div className="project-tags">
                <span className="tag">Hyperdrive Engine</span>
                <span className="tag">Temporal Sync</span>
                <span className="tag">Cosmic Database</span>
              </div>
            </a>
          </div>
        </div>
      )
    },
    contact: {
      title: '联系我',
      content: (
        <div className="other-content">
          <div className="contact-content">
            <div className="contact-info">
              <h3>🌍 找到我的方式</h3>
              <p>通过以下任何方式都能快速联系到我！</p>
            </div>
            
            <div className="contact-methods">
              <div className="contact-method">
                <div className="contact-icon email-icon"></div>
                <div className="contact-details">
                  <h4>量子邮箱</h4>
                  <p>
                    <a href="mailto:mygalaxycn@qq.com" className="contact-link">
                      mygalaxycn@qq.com
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="contact-method">
                <div className="contact-icon discord-icon"></div>
                <div className="contact-details">
                  <h4>Discord</h4>
                  <p>
                    <span className="contact-link">julian_bashir</span>
                    <br />
                    <small style={{color: '#888'}}>游戏聊天首选</small>
                  </p>
                </div>
              </div>
              
              <div className="contact-method">
                <div className="contact-icon github-icon"></div>
                <div className="contact-details">
                  <h4>GitHub</h4>
                  <p>
                    <a href="https://github.com/NCC-17039" target="_blank" rel="noopener noreferrer" className="contact-link">
                      查看我的代码
                    </a>
                    <br />
                    <small style={{color: '#888'}}>开源项目和贡献</small>
                  </p>
                </div>
              </div>
              
              <div className="contact-method">
                <div className="contact-icon spotify-icon"></div>
                <div className="contact-details">
                  <h4>Spotify</h4>
                  <p>
                    <a href="https://open.spotify.com/user/31xorc6jzpia6ttyzk57sz4woppu" target="_blank" rel="noopener noreferrer" className="contact-link">
                      听听我的歌单
                    </a>
                    <br />
                    <small style={{color: '#888'}}>音乐品味分享</small>
                  </p>
                </div>
              </div>
              
              <div className="contact-method">
                <div className="contact-icon bilibili-icon"></div>
                <div className="contact-details">
                  <h4>Bilibili</h4>
                  <p>
                    <a href="https://space.bilibili.com/492976551" target="_blank" rel="noopener noreferrer" className="contact-link">
                      关注我的动态
                    </a>
                    <br />
                    <small style={{color: '#888'}}>视频内容创作</small>
                  </p>
                </div>
              </div>
              
              <div className="contact-method">
                <div className="contact-icon youtube-icon"></div>
                <div className="contact-details">
                  <h4>YouTube</h4>
                  <p>
                    <a href="https://www.youtube.com/@spacemycn" target="_blank" rel="noopener noreferrer" className="contact-link">
                      订阅我的频道
                    </a>
                    <br />
                    <small style={{color: '#888'}}>全球视频分享</small>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="contact-cta">
              <h3>🚀 准备好连接了吗？</h3>
              <p>选择任何一种方式联系我，让我们开始一段有趣的对话！</p>
            </div>
          </div>
        </div>
      )
    }
  }

  // 获取当前年份
  const currentYear = new Date().getFullYear()
  
  return (
    <div className={`app ${activeSection === 'home' ? 'home-active' : ''}`}>
      {/* 首页视频背景 */}
      {activeSection === 'home' && (
        <>
          <div className="home-video-background">
            <video autoPlay muted loop playsInline>
              <source src="https://public.ysjf.com/mediastorm/material/material_preview/A008C0129_250530_884508.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="home-video-overlay"></div>
        </>
      )}
      
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img 
              src="https://user-assets.sxlcdn.com/images/1046536/FpqadbyY9n7LXaAR77KQr9di7xxP.png" 
              alt="NCC-17039 Logo" 
              className="header-logo-image"
            />
            <div className="logo-text-container">
              <span className="logo-text">NCC-17039</span>
              <span className="logo-subtitle">个人网站</span>
            </div>
          </div>
          
          <nav className="nav">
            {Object.keys(sections).map(section => (
              <button
                key={section}
                className={`nav-item ${activeSection === section ? 'active' : ''}`}
                onClick={() => setActiveSection(section)}
              >
                {section === 'home' && '🏠 首页'}
                {section === 'about' && '👨‍🚀 关于'}
                {section === 'projects' && '🛸 项目'}
                {section === 'contact' && '📡 联系'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {sections[activeSection].title && (
            <div className="section-header">
              <h1>{sections[activeSection].title}</h1>
            </div>
          )}
          <div className="section-content">
            {sections[activeSection].content}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2023-{currentYear} 银河系里的地球 ✨</p>
          <div className="footer-links">
            <span>🌍 地球时间: {new Date().toLocaleString('zh-CN')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
