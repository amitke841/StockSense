import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { useState, useEffect } from "react"

function App() {
  const [serverStatus, setServerStatus] = useState("checking") // "checking" | "up" | "down"

  const checkServer = async () => {
    try {
      const response = await fetch("https://<your-render-app-url>/health")
      if (response.ok) {
        setServerStatus("up")
      } else {
        setServerStatus("down")
      }
    } catch (err) {
      setServerStatus("down")
    }
  }

  const waitForServer = async () => {
    while (serverStatus !== "up") {
      await checkServer()
      if (serverStatus !== "up") {
        await new Promise((resolve) => setTimeout(resolve, 2000)) // retry every 2s
      }
    }
  }

  useEffect(() => {
    waitForServer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // While server is not up, show overlay with loading animation
  if (serverStatus !== "up") {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 text-white z-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Starting Server...</h2>
          <p className="mb-4">Please wait while the backend boots up</p>
          {/* Simple CSS spinner */}
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  // Render your main app only when server is ready
  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App
