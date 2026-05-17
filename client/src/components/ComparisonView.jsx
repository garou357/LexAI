import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { FileText, ArrowRightLeft, Sparkles, Loader2, X } from 'lucide-react'
import UploadZone from './UploadZone'

const ComparisonView = ({ documents, token, onUploadSuccess }) => {
  const [docId1, setDocId1] = useState('')
  const [docId2, setDocId2] = useState('')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Sync state if documents are deleted or updated
  useEffect(() => {
    if (docId1 && !documents.find(d => d.id === parseInt(docId1))) setDocId1('')
    if (docId2 && !documents.find(d => d.id === parseInt(docId2))) setDocId2('')
  }, [documents])

  const handleCompare = async () => {
    if (!docId1 || !docId2) return
    
    setError('')
    setIsLoading(true)
    setResult('')

    const API_BASE = import.meta.env.VITE_API_URL || ''
    try {
      const res = await fetch(`${API_BASE}/api/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ docId1, docId2 })
      })

      const data = await res.json()
      if (res.ok) {
        setResult(data.comparison)
      } else {
        setError(data.error || 'Comparison failed')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setIsLoading(false)
    }
  }

  const renderSlot = (slotNum, selectedId, setSelectedId) => {
    const selectedDoc = documents.find(d => d.id === parseInt(selectedId))
    const isCompleted = selectedDoc?.status === 'completed'

    return (
      <div style={{ 
        flex: 1, 
        backgroundColor: '#1e1e1e', 
        padding: '24px', 
        borderRadius: '24px', 
        border: (selectedId && selectedDoc) ? '1px solid #3b82f6' : '1px dashed var(--border-color)',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
          Slot {slotNum === 1 ? 'A' : 'B'}
        </h3>

        {selectedId && selectedDoc ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
            <FileText size={48} color={isCompleted ? '#3b82f6' : 'var(--text-muted)'} />
            <div>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{selectedDoc.filename}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                {isCompleted ? `${selectedDoc.chunks} chunks • Ready` : `Status: ${selectedDoc.status}`}
              </div>
            </div>
            <button 
              onClick={() => setSelectedId('')}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}
            >
              <X size={14} /> Remove
            </button>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <select 
              value={selectedId} 
              onChange={(e) => setSelectedId(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#252525',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '12px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="">Select existing document...</option>
              {documents.filter(d => d.id !== parseInt(slotNum === 1 ? docId2 : docId1)).map(doc => (
                <option key={doc.id} value={doc.id}>{doc.filename}</option>
              ))}
            </select>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
            </div>

            <UploadZone 
              token={token} 
              onUploadSuccess={(newDoc) => {
                onUploadSuccess()
                setSelectedId(newDoc.documentId)
              }} 
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '40px', backgroundColor: '#0f172a' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>Document Comparison</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>Compare two legal documents side-by-side</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'stretch', gap: '32px', marginBottom: '40px' }}>
          {renderSlot(1, docId1, setDocId1)}
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              backgroundColor: '#3b82f6', 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
            }}>
              <ArrowRightLeft size={20} color="white" />
            </div>
          </div>

          {renderSlot(2, docId2, setDocId2)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <button
            onClick={handleCompare}
            disabled={isLoading || !docId1 || !docId2 || documents.find(d => d.id === parseInt(docId1))?.status !== 'completed' || documents.find(d => d.id === parseInt(docId2))?.status !== 'completed'}
            style={{
              backgroundColor: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 48px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s',
              opacity: (isLoading || !docId1 || !docId2) ? 0.6 : 1,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            {isLoading ? 'Analyzing Contracts...' : 'Compare Documents'}
          </button>
        </div>

        {error && (
          <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '32px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ 
            backgroundColor: '#1e1e1e', 
            border: '1px solid var(--border-color)', 
            borderRadius: '24px',
            padding: '40px',
            lineHeight: '1.7',
            color: '#e2e8f0',
            fontSize: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
          }}>
            <ReactMarkdown components={{
              h1: ({node, ...props}) => <h1 style={{color: '#fff', marginTop: '32px', fontSize: '24px'}} {...props} />,
              h2: ({node, ...props}) => <h2 style={{color: '#3b82f6', marginTop: '24px', borderBottom: '1px solid #333', paddingBottom: '8px', fontSize: '20px'}} {...props} />,
              h3: ({node, ...props}) => <h3 style={{color: '#fff', marginTop: '20px', fontSize: '18px'}} {...props} />,
              li: ({node, ...props}) => <li style={{marginBottom: '8px'}} {...props} />
            }}>
              {result}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComparisonView
