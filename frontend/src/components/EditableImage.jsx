import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './EditableImage.css';

const EditableImage = ({
    src,
    alt,
    onSave,
    className = '',
    placeholder = 'Click to add image'
}) => {
    const { isStaff } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageClick = () => {
        if (!isStaff) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB.');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            await onSave(formData);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
            // Clear the input
            e.target.value = '';
        }
    };

    if (!isStaff && !src) {
        // Hide empty images for non-staff users
        return null;
    }

    return (
        <div className={`editable-image-container ${className}`}>
            {src ? (
                <div
                    className={`editable-image ${isStaff ? 'editable' : ''}`}
                    onClick={handleImageClick}
                >
                    <img src={src} alt={alt} />
                    {isStaff && (
                        <div className="image-overlay">
                            {isUploading ? (
                                <span className="uploading">Uploading...</span>
                            ) : (
                                <span className="edit-text">Click to change image</span>
                            )}
                        </div>
                    )}
                </div>
            ) : isStaff ? (
                <div
                    className="image-placeholder editable"
                    onClick={handleImageClick}
                >
                    {isUploading ? (
                        <span className="uploading">Uploading...</span>
                    ) : (
                        <>
                            <span className="plus-icon">+</span>
                            <span>{placeholder}</span>
                        </>
                    )}
                </div>
            ) : null}

            {isStaff && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    disabled={isUploading}
                />
            )}
        </div>
    );
};

export default EditableImage;