import { useState, useEffect } from 'react'
import './LoadingScreen.css'

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [resourcesLoaded, setResourcesLoaded] = useState(false)
  const [isTimeout, setIsTimeout] = useState(false)
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false)

  const loadingSteps = [
    '初始化系统...',
    '连接数据库...',
    '加载背景图片...',
    '准备用户界面...',
    '启动完成...'
  ]

  // 预加载背景图片
  const preloadImages = () => {
    return new Promise((resolve) => {
      const images = [
        'https://images.unsplash.com/photo-1752028228080-60eabd31e649',
        'https://images.unsplash.com/photo-1752026631135-41117a9a7c1e',
        'https://user-assets.sxlcdn.com/images/1046536/FpqadbyY9n7LXaAR77KQr9di7xxP.png'
      ]
      
      let loadedCount = 0
      const totalImages = images.length
      
      // 设置图片加载超时
      const imageTimeout = setTimeout(() => {
        console.warn('图片加载超时，继续进入网站')
        setResourcesLoaded(true)
        resolve()
      }, 15000) // 15秒图片加载超时
      
      images.forEach((src) => {
        const img = new Image()
        img.onload = () => {
          loadedCount++
          if (loadedCount === totalImages) {
            clearTimeout(imageTimeout)
            setResourcesLoaded(true)
            resolve()
          }
        }
        img.onerror = () => {
          console.warn(`图片加载失败: ${src}`)
          loadedCount++
          if (loadedCount === totalImages) {
            clearTimeout(imageTimeout)
            setResourcesLoaded(true)
            resolve()
          }
        }
        img.src = src
      })
    })
  }

  // 强制完成加载
  const forceComplete = () => {
    console.log('强制完成加载')
    setIsTimeout(true)
    setShowTimeoutMessage(true)
    setProgress(100)
    setResourcesLoaded(true)
    
    setTimeout(() => {
      setIsComplete(true)
      setTimeout(() => {
        onLoadingComplete()
      }, 800)
    }, 2000) // 显示2秒超时消息后进入网站
  }

  useEffect(() => {
    let progressTimer
    let stepTimer
    let timeoutTimer
    const totalDuration = 5000 // 5秒，给图片加载更多时间

    const startLoading = () => {
      // 设置20秒超时保护
      timeoutTimer = setTimeout(() => {
        console.warn('加载超时，强制进入网站')
        forceComplete()
      }, 20000)
      
      // 开始预加载图片
      preloadImages()
      
      // 进度条动画
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100 && (resourcesLoaded || isTimeout)) {
            clearInterval(progressTimer)
            clearTimeout(timeoutTimer)
            setTimeout(() => {
              setIsComplete(true)
              setTimeout(() => {
                onLoadingComplete()
              }, 800)
            }, isTimeout ? 0 : 200)
            return 100
          }
          // 如果资源还没加载完，进度条在90%处等待
          const increment = 100 / (totalDuration / 50)
          const newProgress = prev + increment
          return (resourcesLoaded || isTimeout) ? newProgress : Math.min(newProgress, 90)
        })
      }, 50)

      // 步骤文本动画
      let currentStepIndex = 0
      const showNextStep = () => {
        if (currentStepIndex < loadingSteps.length) {
          setCurrentStep(currentStepIndex)
          currentStepIndex++
          stepTimer = setTimeout(showNextStep, totalDuration / loadingSteps.length)
        }
      }
      showNextStep()
    }

    startLoading()

    return () => {
      clearInterval(progressTimer)
      clearTimeout(stepTimer)
      clearTimeout(timeoutTimer)
    }
  }, [onLoadingComplete, resourcesLoaded, isTimeout])

  return (
    <div className={`loading-screen ${isComplete ? 'fade-out' : ''}`}>
      <div className="loading-background"></div>
      
      <div className="loading-container">
        <div className="loading-logo-section">
          <div className="logo-wrapper">
            <img 
              src="https://user-assets.sxlcdn.com/images/1046536/FpqadbyY9n7LXaAR77KQr9di7xxP.png" 
              alt="NCC-17039 Logo" 
              className="loading-logo"
            />
            <div className="logo-ring"></div>
            <div className="logo-ring ring-2"></div>
          </div>
          
          <div className="loading-text">
            <h1 className="site-title">NCC-17039</h1>
            <p className="site-subtitle">银河系里的地球</p>
          </div>
        </div>
        
        <div className="loading-progress-section">
          <div className="progress-container">
            <div className="progress-track">
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
              >
                <div className="progress-glow"></div>
              </div>
            </div>
            <div className="progress-percentage">{Math.round(progress)}%</div>
          </div>
          
          <div className="loading-status">
            {showTimeoutMessage ? (
              <div className="timeout-message">
                <span className="status-text timeout-text">
                  ⚠️ 网络较慢，正在为您跳过加载...
                </span>
              </div>
            ) : (
              <>
            <span className="status-text">
                  {isTimeout ? '准备进入网站...' : (loadingSteps[currentStep] || '加载完成')}
            </span>
            <div className="status-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen