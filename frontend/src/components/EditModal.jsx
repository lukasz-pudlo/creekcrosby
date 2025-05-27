import React, { useState, useEffect } from 'react';

const EditModal = ({ isOpen, onClose, title, data, onSave, fields }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data) {
            setFormData({ ...data });
        }
    }, [data]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            console.error('Save error:', err);
            alert('Failed to save changes');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    };

    const contentStyle = {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <h3 style={{ color: '#ff0000', marginBottom: '1rem' }}>{title}</h3>

                <form onSubmit={handleSubmit}>
                    {fields.map(field => (
                        <div key={field.name} style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                {field.label}
                            </label>
                            {field.type === 'textarea' ? (
                                <textarea
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    rows={field.rows || 4}
                                    required={field.required}
                                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
                                />
                            ) : field.type === 'datetime-local' ? (
                                <input
                                    type="datetime-local"
                                    name={field.name}
                                    value={formData[field.name] ? new Date(formData[field.name]).toISOString().slice(0, 16) : ''}
                                    onChange={handleChange}
                                    required={field.required}
                                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
                                />
                            ) : (
                                <input
                                    type={field.type || 'text'}
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    required={field.required}
                                    style={{ width: '100%', padding: '0.5rem', backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
                                />
                            )}
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{ backgroundColor: '#ff0000', color: '#fff', padding: '0.5rem 1rem' }}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;