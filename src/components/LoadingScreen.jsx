import { useState, useEffect } from 'react'
import './LoadingScreen.css'

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [resourcesLoaded, setResourcesLoaded] = useState(false)

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
      
      images.forEach((src) => {
        const img = new Image()
        img.onload = () => {
          loadedCount++
          if (loadedCount === totalImages) {
            setResourcesLoaded(true)
            resolve()
          }
        }
        img.onerror = () => {
          loadedCount++
          if (loadedCount === totalImages) {
            setResourcesLoaded(true)
            resolve()
          }
        }
        img.src = src
      })
    })
  }

  useEffect(() => {
    let progressTimer
    let stepTimer
    const totalDuration = 5000 // 5秒，给图片加载更多时间

    const startLoading = () => {
      // 开始预加载图片
      preloadImages()
      
      // 进度条动画
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100 && resourcesLoaded) {
            clearInterval(progressTimer)
            setTimeout(() => {
              setIsComplete(true)
              setTimeout(() => {
                onLoadingComplete()
              }, 800)
            }, 200)
            return 100
          }
          // 如果资源还没加载完，进度条在90%处等待
          const increment = 100 / (totalDuration / 50)
          const newProgress = prev + increment
          return resourcesLoaded ? newProgress : Math.min(newProgress, 90)
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
    }
  }, [onLoadingComplete, resourcesLoaded])

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
            <span className="status-text">
              {loadingSteps[currentStep] || '加载完成'}
            </span>
            <div className="status-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen