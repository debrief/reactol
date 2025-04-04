import { useState, useEffect, useCallback } from 'react'
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride'
import Cookies from 'js-cookie'

// Define the walkthrough cookie name
const WALKTHROUGH_COOKIE_NAME = 'albatross-walkthrough-completed'

export const useWalkthrough = () => {
  // State to control the walkthrough
  const [run, setRun] = useState(false)
  const [steps, setSteps] = useState<Step[]>([])
  const [stepIndex, setStepIndex] = useState(0)

  // Check if the user has completed the walkthrough before
  useEffect(() => {
    const hasCompletedWalkthrough = Cookies.get(WALKTHROUGH_COOKIE_NAME) === 'true'
    
    // If this is a new user (no cookie), automatically start the walkthrough
    if (!hasCompletedWalkthrough) {
      // Small delay to ensure the UI is fully rendered
      const timer = setTimeout(() => {
        setRun(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  // Define the walkthrough steps
  useEffect(() => {
    setSteps([
      {
        target: '.welcome-title',
        content: 'Welcome to Albatross! This walkthrough will guide you through the basic features of the application.',
        disableBeacon: true,
        placement: 'bottom',
      },
      {
        target: '.new-button',
        content: 'Click here to create a new empty document.',
        disableBeacon: true,
        placement: 'bottom',
      },
      {
        target: '.sample-button',
        content: 'Click here to create a new document with sample data to explore the features.',
        disableBeacon: true,
        placement: 'bottom',
      },
      {
        target: '.open-button',
        content: 'Click here to open an existing document from your computer.',
        disableBeacon: true,
        placement: 'top',
      },
      {
        target: '.drag-drop-area',
        content: 'You can also drag and drop GeoJSON files here to open them.',
        disableBeacon: true,
        placement: 'bottom',
      }
    ])
  }, [])

  // Handle walkthrough events
  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, index } = data
    
    // Update the current step index
    setStepIndex(index)
    
    // Handle walkthrough completion
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false)
      
      // Set a cookie to remember that the user has completed the walkthrough
      Cookies.set(WALKTHROUGH_COOKIE_NAME, 'true', { expires: 365 }) // Expires in 1 year
    }
  }, [])

  // Function to manually start the walkthrough
  const startWalkthrough = useCallback(() => {
    setRun(true)
    setStepIndex(0)
  }, [])

  // Return the Joyride component and control functions
  return {
    Walkthrough: () => (
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={run}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={steps}
        stepIndex={stepIndex}
        styles={{
          options: {
            zIndex: 10000,
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      />
    ),
    startWalkthrough,
    isRunning: run,
  }
}
