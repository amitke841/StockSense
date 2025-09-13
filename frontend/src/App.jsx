import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react";

function App() {
  // const [serverStatus, setServerStatus] = useState("checking") // "checking" | "up" | "down"

  // const waitForServer = async () => {
  //   let serverUp = false
  //   while (!serverUp) {
  //     try {
  //       const response = await fetch("https://stocksense-3oql.onrender.com/health")
  //       if (response.ok) {
  //         serverUp = true
  //         setServerStatus("up") // update state only once
  //       } else {
  //           await new Promise(resolve => setTimeout(resolve, 4000))
  //         }
  //         } catch (err) {
  //         await new Promise(resolve => setTimeout(resolve, 4000))
  //     }
  //   }
  // }

  // useEffect(() => {
  //   waitForServer()
  // }, [])

  // // While server is not up, show overlay
  // if (serverStatus !== "up") {
  //   return (
  //     <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 text-white z-50">
  //     <div className="flex items-center mb-16">
  //       <div className="mr-4 flex-shrink-0">
  //       <div className="w-16 h-16 md:w-23 md:h-23 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
  //         <TrendingUp className="w-10 h-10 md:w-13 md:h-13 text-white" />
  //       </div>
  //       </div>
  //       <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
  //       StockSense
  //       </h1>
  //     </div>
  //     <div className="text-center">
  //       <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
  //       <h2 className="text-2xl font-bold mb-4 mt-16">Starting Server...</h2>
  //       <p className="mb-4">Please wait while the backend boots up. this may take up to 1 minute.</p>
  //     </div>
  //     </div>
  //   )
  // }

  // // Render main app only when server is ready
  return (
    <>
      <Pages />
      <Toaster />
    </>
  )
}

export default App