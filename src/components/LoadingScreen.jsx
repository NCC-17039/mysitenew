import { useState, useEffect } from 'react'
import './LoadingScreen.css'

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const loadingSteps = [
    { text: '初始化量子引擎...', duration: 800 },
    { text: '连接银河系网络...', duration: 900 },
    { text: '加载星际数据库...', duration: 700 },
    { text: '同步时空坐标...', duration: 600 },
    { text: '启动传送门...', duration: 500 }
  ]

  useEffect(() => {
    let progressTimer
    let stepTimer
    let totalDuration = 0

    const startLoading = () => {
      // 计算总时长，确保至少4秒
      const calculatedDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0)
      totalDuration = Math.max(4000, calculatedDuration)

      // 进度条动画
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer)
            setTimeout(() => {
              setIsComplete(true)
              setTimeout(() => {
                onLoadingComplete()
              }, 500)
            }, 300)
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
      <div className="loading-background">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
      
      <div className="loading-content">
        <div className="logo-container">
          <img 
            src="https://user-assets.sxlcdn.com/images/1046536/FpqadbyY9n7LXaAR77KQr9di7xxP.png" 
            alt="NCC-17039 Logo" 
            className="loading-logo"
          />
          <div className="logo-glow"></div>
        </div>
        
        <h1 className="loading-title">NCC-17039</h1>
        <p className="loading-subtitle">银河系里的地球</p>
        
        <div className="loading-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{Math.round(progress)}%</div>
        </div>
        
        <div className="loading-steps">
          <p className="current-step">
            {loadingSteps[currentStep]?.text || '准备完成...'}
          </p>
        </div>
        
        <div className="loading-effects">
          <div className="pulse-ring"></div>
          <div className="pulse-ring delay-1"></div>
          <div className="pulse-ring delay-2"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen