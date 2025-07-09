import { useState, useEffect } from 'react'
import './LoadingScreen.css'

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const loadingSteps = [
    '初始化系统...',
    '连接服务器...',
    '加载资源...',
    '准备界面...',
    '启动完成...'
  ]

  useEffect(() => {
    let progressTimer
    let stepTimer
    const totalDuration = 4000 // 4秒

    const startLoading = () => {
      // 进度条动画
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer)
            setTimeout(() => {
              setIsComplete(true)
              setTimeout(() => {
                onLoadingComplete()
              }, 800)
            }, 200)
            return 100
          }
          return prev + (100 / (totalDuration / 50))
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
  }, [onLoadingComplete])

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