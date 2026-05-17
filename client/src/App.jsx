import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import Toast from './components/Toast'
import AuthForm from './components/AuthForm'
import ComparisonView from './components/ComparisonView'
import { LogOut } from 'lucide-react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

function App() {
  const [token, setToken] = useState(localStorage.getItem('lexai_token'))
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lexai_user') || 'null')
    } catch {
      return null
    }
  })
  const [currentView, setCurrentView] = useState('chat')
  
  const [documents, setDocuments] = useState([])
  const [activeDoc, setActiveDoc] = useState(null)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [toast, setToast] = useState({ isOpen: false, message: '' })

  const showToast = (message) => {
    setToast({ isOpen: true, message })
  }

  const fetchDocuments = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.status === 401 || res.status === 403) return handleLogout()
      const data = await res.json()
      setDocuments(data)
      
      // Update activeDoc if it exists in the new list to get latest status/summary
      if (activeDoc) {
        const updatedActive = data.find(d => d.id === activeDoc.id)
        if (updatedActive) setActiveDoc(updatedActive)
      } else if (data.length > 0 && !activeDoc) {
        setActiveDoc(data[0])
      }
    } catch (err) {
      console.error('Failed to fetch documents', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('lexai_token')
    localStorage.removeItem('lexai_user')
    setToken(null)
    setUser(null)
    setDocuments([])
    setActiveDoc(null)
    setMessages([])
  }

  useEffect(() => {
    if (token) fetchDocuments()
  }, [token])

  // Polling for processing documents
  useEffect(() => {
    if (!token) return
    const needsPolling = documents.some(doc => doc.status === 'pending' || doc.status === 'processing')
    
    if (needsPolling) {
      const interval = setInterval(fetchDocuments, 3000)
      return () => clearInterval(interval)
    }
  }, [documents, token])

  useEffect(() => {
    if (activeDoc && token && currentView === 'chat') {
      const fetchMessages = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/documents/${activeDoc.id}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (res.status === 401 || res.status === 403) return handleLogout()
          const data = await res.json()
          setMessages(data)
        } catch (err) {
          console.error('Failed to fetch messages', err)
        }
      }
      fetchMessages()
    } else if (currentView === 'chat') {
      setMessages([])
    }
  }, [activeDoc, token, currentView])

  const handleSendMessage = async (text) => {
    if (!activeDoc || !token) return
    
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    try {
      const res = await fetch(`${API_BASE}/api/ask?docId=${activeDoc.id}&q=${encodeURIComponent(text)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.status === 401 || res.status === 403) return handleLogout()
      
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      
      let aiMsg = { role: 'ai', content: '' }
      setMessages(prev => [...prev, aiMsg])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const tokenStr = line.substring(6)
            if (tokenStr.trim() === '[DONE]') break
            if (tokenStr) {
              aiMsg.content += tokenStr
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { ...aiMsg }
                return updated
              })
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error', err)
    } finally {
      setIsTyping(false)
    }
  }

  const handleRemoveDoc = async (id) => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/api/documents/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.status === 401 || res.status === 403) return handleLogout()
      if (res.ok) {
        if (activeDoc?.id === id) setActiveDoc(null)
        fetchDocuments()
        showToast('Document deleted successfully')
      }
    } catch (err) {
      console.error('Failed to delete document', err)
    }
  }

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken)
    setUser(newUser)
    showToast(`Welcome back, ${newUser.email}`)
  }

  if (!token) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className="main-wrapper">
      <nav className="top-nav">
        <div className="nav-container">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${currentView === 'chat' ? 'active' : ''}`}
              onClick={() => setCurrentView('chat')}
            >
              Main chat
            </button>
            <button 
              className={`nav-tab ${currentView === 'comparison' ? 'active' : ''}`}
              onClick={() => setCurrentView('comparison')}
            >
              Document comparison
            </button>
          </div>

          <button className="logout-btn" onClick={handleLogout} title={`Logout (${user?.email})`}>
            <span className="user-email">{user?.email}</span>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <div className="app-container">
        {currentView === 'chat' ? (
          <>
            <Sidebar 
              documents={documents} 
              activeDoc={activeDoc} 
              setActiveDoc={setActiveDoc}
              onUploadSuccess={fetchDocuments}
              onRemoveDoc={handleRemoveDoc}
              token={token}
            />
            <ChatArea 
              activeDoc={activeDoc} 
              messages={messages} 
              onSendMessage={handleSendMessage}
              isTyping={isTyping}
              token={token}
            />
          </>
        ) : (
          <ComparisonView documents={documents} token={token} onUploadSuccess={fetchDocuments} />
        )}
      </div>
      
      <Toast 
        isOpen={toast.isOpen} 
        message={toast.message} 
        onClose={() => setToast({ ...toast, isOpen: false })} 
      />
    </div>
  )
}

export default App
