"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotActionHandler } from "./components/CopilotActionHandler";
import { CopilotKitCSSProperties } from "@copilotkit/react-ui";
import { MCPConfigForm } from "./components/MCPConfigForm";
import { useState, useEffect } from "react";
import { useAuth } from "./hooks/useAuth";
import Link from "next/link";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.user-dropdown')) {
          setIsDropdownOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Client component that sets up the Copilot action handler */}
      <CopilotActionHandler />

      {/* Main content area */}
      <div className="flex-1 p-4 md:p-8 lg:mr-[30vw] flex flex-col">
        {/* Authentication header */}
        {mounted && (
          <div className="mb-8 flex flex-col">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold"></h1>
              
              <div className="flex items-center gap-4">
                {user ? (
                  <div className="relative user-dropdown">
                    <button 
                      className="flex items-center gap-2 outline-none focus:outline-none" 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {user.email?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {user.email?.split('@')[0] || 'User'}
                      </span>
                      {/* Dropdown arrow */}
                      <svg 
                        className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    
                    {/* Dropdown menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 animate-fadeIn">
                        <div className="px-4 py-2 border-b">
                          <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                          <p className="text-sm text-gray-700 truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            signOut();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-600"></div>
                  </>
                )}
              </div>
            </div>
            
            {/* {user && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h2 className="text-xl font-semibold text-blue-800 mb-2">Welcome back, {user.email?.split('@')[0] || 'User'}!</h2>
                <p className="text-blue-700">You are successfully logged in. Your session is active.</p>
              </div>
            )} */}
          </div>
        )}
        
        <MCPConfigForm />
      </div>

      {/* Mobile chat toggle button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-gray-800 text-white rounded-full shadow-lg lg:hidden hover:bg-gray-700"
        aria-label="Toggle chat"
      >
        {isChatOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Fixed sidebar - hidden on mobile, shown on larger screens */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[80vw] lg:w-[30vw] border-l bg-white shadow-md transition-transform duration-300 ${
          isChatOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
        style={
          {
            "--copilot-kit-primary-color": "#4F4F4F",
          } as CopilotKitCSSProperties
        }
      >
        <CopilotChat
          className="h-full flex flex-col"
          instructions={
            "You are assisting the user as best as you can. Answer in the best way possible given the data you have."
          }
          labels={{
            title: "MCP Assistant",
            initial: "Ask anything",
          }}
        />
      </div>
    </div>
  );
}
