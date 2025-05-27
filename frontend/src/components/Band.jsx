import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../context/AuthContext';
import { useMedia } from '../context/MediaContext';
import EditModal from './EditModal';
import axios from 'axios';
import './Band.css';

const Band = ({ band, onBandUpdate }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const { editMode } = useAuth();
    const [editingMember, setEditingMember] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Check if useMedia is available and use it safely
    let getFullMediaUrl;
    try {
        const mediaContext = useMedia();
        getFullMediaUrl = mediaContext?.getFullMediaUrl;
    } catch (error) {
        console.error('Error using MediaContext:', error);
        // Fallback function if context is not available
        getFullMediaUrl = url => url;
    }

    const handleEditMember = (member) => {
        setEditingMember(member);
        setShowEditModal(true);
    };

    const handleAddMember = () => {
        setEditingMember(null);
        setShowAddModal(true);
    };

    const handleSaveMember = async (formData) => {
        const memberData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                memberData.append(key, formData[key]);
            }
        });

        if (editingMember) {
            // Update existing member
            await axios.patch(`/api/band/${editingMember.id}/`, memberData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } else {
            // Create new member
            await axios.post('/api/band/', memberData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }

        // Refresh band data
        if (onBandUpdate) {
            onBandUpdate();
        }

        setShowEditModal(false);
        setShowAddModal(false);
    };

    const handleDeleteMember = async (memberId) => {
        if (window.confirm('Are you sure you want to delete this band member?')) {
            await axios.delete(`/api/band/${memberId}/`);
            if (onBandUpdate) {
                onBandUpdate();
            }
        }
    };

    const memberFields = [
        { name: 'name', label: 'Member Name', type: 'text', required: true },
        { name: 'position', label: 'Position/Instrument', type: 'text', required: true },
        { name: 'bio', label: 'Biography', type: 'textarea', rows: 4, required: true },
        { name: 'order', label: 'Display Order', type: 'number', required: true },
        { name: 'image', label: 'Member Photo', type: 'file' }
    ];

    return (
        <>
            <section className={`band ${editMode ? 'edit-mode' : ''}`} id="band">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Our Band</h2>
                        {editMode && (
                            <button className="add-button" onClick={handleAddMember}>
                                + Add Member
                            </button>
                        )}
                    </div>

                    <div
                        className={`band-grid ${inView ? 'animate' : ''}`}
                        ref={ref}
                    >
                        {band && band.length > 0 ? (
                            band.map((member) => (
                                <div key={member.id} className="band-member editable-item">
                                    {editMode && (
                                        <div className="edit-controls">
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEditMember(member)}
                                                title="Edit Member"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteMember(member.id)}
                                                title="Delete Member"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}

                                    {member.image ? (
                                        <div className="member-image">
                                            <img
                                                src={getFullMediaUrl ? getFullMediaUrl(member.image) : member.image}
                                                alt={`${member.name}, ${member.position}`}
                                            />
                                        </div>
                                    ) : (
                                        <div className="member-image member-placeholder">
                                            <span className="initials">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="member-info">
                                        <h3>{member.name}</h3>
                                        <p className="member-position">{member.position}</p>
                                        <p className="member-bio">{member.bio}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-band">
                                <p>Band information coming soon!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <EditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={`Edit Member: ${editingMember?.name || ''}`}
                data={editingMember}
                onSave={handleSaveMember}
                fields={memberFields}
            />

            <EditModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Band Member"
                data={{}}
                onSave={handleSaveMember}
                fields={memberFields}
            />
        </>
    );
};

export default Band;