import React, { useState } from 'react'
import { Upload, FileUp } from 'lucide-react'

const UploadZone = ({ onUploadSuccess, token }) => {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('pdf', file)

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      if (res.ok) {
        onUploadSuccess()
      }
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="upload-zone" style={{
      border: '1px dashed var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
    }}>
      <FileUp size={32} color="var(--text-muted)" />
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
        Drop a contract PDF here or click to browse
      </p>
      
      <label className="upload-button" style={{
        backgroundColor: '#1e1e1e',
        border: '1px solid var(--border-color)',
        padding: '10px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        justifyContent: 'center',
        transition: 'background-color 0.2s'
      }}>
        <Upload size={16} />
        {isUploading ? 'Uploading...' : 'Upload PDF'}
        <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
      </label>
    </div>
  )
}

export default UploadZone
