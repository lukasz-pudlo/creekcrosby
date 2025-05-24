import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './EditableText.css';

const EditableText = ({
    text,
    onSave,
    tag = 'p',
    className = '',
    placeholder = 'Click to edit...',
    multiline = false
}) => {
    const { isStaff } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(text || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleStartEdit = () => {
        if (!isStaff) return;
        setIsEditing(true);
        setEditValue(text || '');
    };

    const handleSave = async () => {
        if (editValue.trim() === text) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            await onSave(editValue.trim());
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving:', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditValue(text || '');
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !multiline && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (!isStaff) {
        // Non-staff users see regular text
        const Tag = tag;
        return (
            <Tag className={className}>
                {text || placeholder}
            </Tag>
        );
    }

    if (isEditing) {
        return (
            <div className={`editable-container ${className}`}>
                {multiline ? (
                    <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="editable-input editable-textarea"
                        autoFocus
                        disabled={isSaving}
                    />
                ) : (
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="editable-input"
                        autoFocus
                        disabled={isSaving}
                    />
                )}
                <div className="editable-controls">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-save"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="btn-cancel"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    const Tag = tag;
    return (
        <Tag
            className={`${className} editable-text`}
            onClick={handleStartEdit}
            title="Click to edit"
        >
            {text || <span className="placeholder">{placeholder}</span>}
            <span className="edit-icon">✏️</span>
        </Tag>
    );
};

export default EditableText;