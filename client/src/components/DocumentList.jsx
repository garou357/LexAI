import React, { useState } from 'react'
import { FileText, X } from 'lucide-react'
import DeleteModal from './DeleteModal'

const DocumentList = ({ documents, activeDoc, setActiveDoc, onRemoveDoc }) => {
  const [docToDelete, setDocToDelete] = useState(null)

  const handleRemoveClick = (e, doc) => {
    e.stopPropagation()
    setDocToDelete(doc)
  }

  const confirmDelete = () => {
    if (docToDelete) {
      onRemoveDoc(docToDelete.id)
      setDocToDelete(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {documents.map(doc => (
        <div 
          key={doc.id}
          onClick={() => setActiveDoc(doc)}
          style={{
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            border: activeDoc?.id === doc.id ? '1px solid #3b82f6' : '1px solid transparent',
            backgroundColor: activeDoc?.id === doc.id ? 'rgba(59, 130, 246, 0.1)' : '#1e1e1e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget.querySelector('.delete-btn')
            if (btn) btn.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget.querySelector('.delete-btn')
            if (btn) btn.style.opacity = '0'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} color={activeDoc?.id === doc.id ? '#3b82f6' : 'var(--text-muted)'} />
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: activeDoc?.id === doc.id ? '#fff' : '#e2e8f0',
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {doc.filename}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '24px' }}>
              {doc.chunks} chunks {activeDoc?.id === doc.id && '• active'}
            </div>
          </div>
          
          <button 
            className="delete-btn"
            onClick={(e) => handleRemoveClick(e, doc)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s',
              zIndex: 2
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {documents.length === 0 && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>No documents uploaded yet</p>
      )}

      <DeleteModal 
        isOpen={!!docToDelete}
        filename={docToDelete?.filename}
        onClose={() => setDocToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default DocumentList
