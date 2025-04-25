"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useClientContext } from "@/context/client-context"
import { useAuth } from "@/context/auth-context"
import { LogOut, Search, Settings, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "./mode-toggle"
import NotificationCenter from "./notification/notification-center"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface NavBarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function NavBar({ activeTab, setActiveTab }: NavBarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{ shopId: string; clientName: string }>>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { clients } = useClientContext()
  const { user, logout, isAdmin } = useAuth()

  // Handle clicks outside search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([])
      return
    }

    const term = searchTerm.toLowerCase()
    const results = clients
      .filter((client) => client.shopId.toLowerCase().includes(term) || client.clientName.toLowerCase().includes(term))
      .slice(0, 5) // Limit to 5 results
      .map((client) => ({
        shopId: client.shopId,
        clientName: client.clientName,
      }))

    setSearchResults(results)
  }, [searchTerm, clients])

  // Toggle calculator function
  const toggleCalculator = () => {
    const calculatorEl = document.getElementById("calculator-popup")
    if (calculatorEl) {
      calculatorEl.classList.toggle("hidden")
    } else {
      createCalculator()
    }
  }

  // Create calculator function
  const createCalculator = () => {
    // Create calculator popup
    const popup = document.createElement("div")
    popup.id = "calculator-popup"
    popup.className =
      "fixed top-20 right-4 z-50 bg-background border rounded-lg shadow-lg p-4 w-72 animate-in fade-in slide-in-from-top-10 duration-300"

    // Calculator display
    const display = document.createElement("div")
    display.className =
      "bg-muted/50 p-3 rounded-md mb-3 text-right text-xl font-mono h-14 flex items-center justify-end overflow-hidden"
    display.id = "calc-display"
    display.textContent = "0"

    // Calculator buttons container
    const buttonsContainer = document.createElement("div")
    buttonsContainer.className = "grid grid-cols-4 gap-2"

    // Calculator buttons configuration
    const buttons = [
      { text: "C", class: "col-span-2 bg-red-500/80 hover:bg-red-600 text-white", action: "clear" },
      { text: "⌫", class: "bg-amber-500/80 hover:bg-amber-600 text-white", action: "backspace" },
      { text: "÷", class: "bg-blue-500/80 hover:bg-blue-600 text-white", action: "operator" },
      { text: "7", class: "", action: "number" },
      { text: "8", class: "", action: "number" },
      { text: "9", class: "", action: "number" },
      { text: "×", class: "bg-blue-500/80 hover:bg-blue-600 text-white", action: "operator" },
      { text: "4", class: "", action: "number" },
      { text: "5", class: "", action: "number" },
      { text: "6", class: "", action: "number" },
      { text: "-", class: "bg-blue-500/80 hover:bg-blue-600 text-white", action: "operator" },
      { text: "1", class: "", action: "number" },
      { text: "2", class: "", action: "number" },
      { text: "3", class: "", action: "number" },
      { text: "+", class: "bg-blue-500/80 hover:bg-blue-600 text-white", action: "operator" },
      { text: "0", class: "col-span-2", action: "number" },
      { text: ".", class: "", action: "decimal" },
      { text: "=", class: "bg-green-500/80 hover:bg-green-600 text-white", action: "equals" },
    ]

    // Create calculator state
    const calcState = {
      displayValue: "0",
      firstOperand: null,
      waitingForSecondOperand: false,
      operator: null,
    }

    // Calculator logic
    const performCalculation = {
      "+": (firstOperand, secondOperand) => firstOperand + secondOperand,
      "-": (firstOperand, secondOperand) => firstOperand - secondOperand,
      "×": (firstOperand, secondOperand) => firstOperand * secondOperand,
      "÷": (firstOperand, secondOperand) => (secondOperand !== 0 ? firstOperand / secondOperand : "Error"),
    }

    // Create and append buttons
    buttons.forEach((btn) => {
      const button = document.createElement("button")
      button.className = `p-3 rounded-md transition-colors ${btn.class} ${
        !btn.class.includes("bg-") ? "bg-muted/70 hover:bg-muted" : ""
      }`
      button.textContent = btn.text

      button.addEventListener("click", () => {
        const display = document.getElementById("calc-display")

        switch (btn.action) {
          case "number":
            if (calcState.waitingForSecondOperand) {
              calcState.displayValue = btn.text
              calcState.waitingForSecondOperand = false
            } else {
              calcState.displayValue = calcState.displayValue === "0" ? btn.text : calcState.displayValue + btn.text
            }
            break
          case "decimal":
            if (!calcState.displayValue.includes(".")) {
              calcState.displayValue += "."
            }
            break
          case "operator":
            const inputValue = Number.parseFloat(calcState.displayValue)

            if (calcState.firstOperand === null) {
              calcState.firstOperand = inputValue
            } else if (calcState.operator) {
              const result = performCalculation[calcState.operator](calcState.firstOperand, inputValue)
              calcState.displayValue = String(result)
              calcState.firstOperand = result
            }

            calcState.waitingForSecondOperand = true
            calcState.operator = btn.text
            break
          case "equals":
            if (!calcState.operator || calcState.firstOperand === null) return

            const secondOperand = Number.parseFloat(calcState.displayValue)
            const result = performCalculation[calcState.operator](calcState.firstOperand, secondOperand)

            calcState.displayValue = String(result)
            calcState.firstOperand = result
            calcState.operator = null
            calcState.waitingForSecondOperand = false
            break
          case "clear":
            calcState.displayValue = "0"
            calcState.firstOperand = null
            calcState.waitingForSecondOperand = false
            calcState.operator = null
            break
          case "backspace":
            calcState.displayValue = calcState.displayValue.length > 1 ? calcState.displayValue.slice(0, -1) : "0"
            break
        }

        display.textContent = calcState.displayValue
      })

      buttonsContainer.appendChild(button)
    })

    // Keyboard shortcut info
    const shortcutInfo = document.createElement("div")
    shortcutInfo.className = "text-xs text-muted-foreground mt-3 text-center"
    shortcutInfo.textContent = "Press Shift + C to toggle calculator"

    // Close button
    const closeButton = document.createElement("button")
    closeButton.className = "absolute top-2 right-2 text-muted-foreground hover:text-foreground"
    closeButton.innerHTML = "✕"
    closeButton.addEventListener("click", () => {
      document.getElementById("calculator-popup").classList.add("hidden")
    })

    // Append all elements
    popup.appendChild(closeButton)
    popup.appendChild(display)
    popup.appendChild(buttonsContainer)
    popup.appendChild(shortcutInfo)

    // Add drag functionality
    let isDragging = false
    let offsetX, offsetY

    const dragHandle = document.createElement("div")
    dragHandle.className = "absolute top-0 left-0 right-0 h-8 cursor-move"
    dragHandle.addEventListener("mousedown", (e) => {
      isDragging = true
      const rect = popup.getBoundingClientRect()
      offsetX = e.clientX - rect.left
      offsetY = e.clientY - rect.top
    })

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return
      const x = e.clientX - offsetX
      const y = e.clientY - offsetY
      popup.style.left = `${x}px`
      popup.style.top = `${y}px`
    })

    document.addEventListener("mouseup", () => {
      isDragging = false
    })

    popup.appendChild(dragHandle)

    // Add to document
    document.body.appendChild(popup)
  }

  // Add keyboard shortcut for calculator (Shift + C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Shift + C is pressed (keyCode 67 is 'c')
      if (e.shiftKey && e.keyCode === 67) {
        // Don't trigger if user is typing in an input field or textarea
        if (
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement
        ) {
          return
        }

        toggleCalculator()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const navigateTo = (tab: string) => {
    if (tab === "dashboard") {
      router.push("/")
      setActiveTab("dashboard")
    } else {
      router.push(`/?tab=${tab}`)
      setActiveTab(tab)
    }
  }

  const handleClientClick = (shopId: string) => {
    router.push(`/clients/${shopId}`)
    setShowSearchResults(false)
    setSearchTerm("")
  }

  const handleLogout = () => {
    logout()
  }

  const getInitials = (name: string) => {
    return name?.substring(0, 2).toUpperCase() || "??"
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-md border-b h-16 pl-16 md:pl-64 shadow-sm">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Empty or can be used for branding */}
        <div className="flex-1">{/* This space can be used for a logo or brand name if needed */}</div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-2">
          {/* Notification icon */}
          <div className="relative">
            <NotificationCenter />
          </div>

          {/* Calculator icon */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={toggleCalculator}
              title="Calculator (Shift+C)"
            >
              <Calculator className="h-4 w-4" />
            </Button>
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-[180px] sm:max-w-xs md:max-w-md mx-2" ref={searchRef}>
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200 z-10" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowSearchResults(true)
                }}
                className="pl-10 w-full text-sm bg-background/80 hover:bg-background/90 focus:bg-background border-muted/50 focus:border-primary/50 transition-all duration-200 rounded-md"
                onFocus={() => setShowSearchResults(true)}
              />
            </div>
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-background/95 backdrop-blur-sm border rounded-md shadow-lg animate-fade-in overflow-hidden">
                {searchResults.map((result, index) => (
                  <div
                    key={result.shopId}
                    className={`p-3 hover:bg-primary/5 cursor-pointer transition-colors duration-150 ${
                      index !== searchResults.length - 1 ? "border-b border-border/50" : ""
                    }`}
                    onClick={() => handleClientClick(result.shopId)}
                  >
                    <div className="font-medium text-sm">{result.shopId}</div>
                    <div className="text-xs text-muted-foreground truncate">{result.clientName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <div className="mx-1">
            <ModeToggle />
          </div>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-9 w-9 p-0 ml-1 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-primary/10 scale-0 group-hover:scale-100 transition-transform duration-200 rounded-full"></div>
                <Avatar className="h-8 w-8 transition-transform group-hover:scale-105 duration-200">
                  <AvatarImage src={localStorage.getItem("userAvatar") || ""} alt="User avatar" />
                  <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                    {user ? getInitials(user.username) : "??"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 overflow-hidden p-0">
              <div className="bg-primary/5 dark:bg-primary/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-background">
                    <AvatarImage src={localStorage.getItem("userAvatar") || ""} alt="User avatar" />
                    <AvatarFallback className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                      {user ? getInitials(user.username) : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">{user?.role}</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <DropdownMenuItem onClick={() => navigateTo("settings")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

interface NavButtonProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}

function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "relative h-9 px-4 transition-all duration-200 overflow-hidden",
        active ? "text-primary font-medium" : "text-muted-foreground",
      )}
    >
      <div className="flex items-center">
        <span className={cn("mr-2", active ? "text-primary" : "text-muted-foreground")}>{icon}</span>
        <span>{label}</span>
      </div>
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full animate-fade-in" />}
    </Button>
  )
}
