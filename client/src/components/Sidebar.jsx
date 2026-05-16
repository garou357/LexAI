import React from 'react'
import UploadZone from './UploadZone'
import DocumentList from './DocumentList'
import { LayoutGrid } from 'lucide-react'

const Sidebar = ({ documents, activeDoc, setActiveDoc, onUploadSuccess, onRemoveDoc, token }) => {
  return (
    <div className="sidebar">
      <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#3b82f6', padding: '6px', borderRadius: '6px' }}>
          <LayoutGrid size={20} color="white" />
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>LexAI</h1>
      </div>

      <UploadZone onUploadSuccess={onUploadSuccess} token={token} />

      <div style={{ marginTop: '32px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
          Documents
        </h3>
        <DocumentList 
          documents={documents} 
          activeDoc={activeDoc} 
          setActiveDoc={setActiveDoc} 
          onRemoveDoc={onRemoveDoc}
        />
      </div>
    </div>
  )
}

export default Sidebar
