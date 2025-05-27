import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../context/AuthContext';
import EditModal from './EditModal';
import axios from 'axios';
import './About.css';

const About = ({ aboutData, onAboutUpdate }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const { editMode } = useAuth();
    const [editingSection, setEditingSection] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleEditSection = (section) => {
        setEditingSection(section);
        setShowEditModal(true);
    };

    const handleAddSection = () => {
        setEditingSection(null);
        setShowAddModal(true);
    };

    const handleSaveSection = async (formData) => {
        const sectionData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                sectionData.append(key, formData[key]);
            }
        });

        if (editingSection) {
            // Update existing section
            await axios.patch(`/api/about/${editingSection.id}/`, sectionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } else {
            // Create new section
            await axios.post('/api/about/', sectionData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }

        // Refresh about data
        if (onAboutUpdate) {
            onAboutUpdate();
        }

        setShowEditModal(false);
        setShowAddModal(false);
    };

    const handleDeleteSection = async (sectionId) => {
        if (window.confirm('Are you sure you want to delete this section?')) {
            await axios.delete(`/api/about/${sectionId}/`);
            if (onAboutUpdate) {
                onAboutUpdate();
            }
        }
    };

    const sectionFields = [
        { name: 'title', label: 'Section Title', type: 'text', required: true },
        { name: 'content', label: 'Content', type: 'textarea', rows: 6, required: true },
        { name: 'image', label: 'Section Image', type: 'file' }
    ];

    return (
        <>
            <section className={`about ${editMode ? 'edit-mode' : ''}`} id="about">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">About Us</h2>
                        {editMode && (
                            <button className="add-button" onClick={handleAddSection}>
                                + Add Section
                            </button>
                        )}
                    </div>

                    <div
                        className={`about-content ${inView ? 'animate' : ''}`}
                        ref={ref}
                    >
                        {aboutData && aboutData.length > 0 ? (
                            aboutData.map((section, index) => (
                                <div key={section.id} className={`about-item editable-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                                    {editMode && (
                                        <div className="edit-controls">
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEditSection(section)}
                                                title="Edit Section"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteSection(section.id)}
                                                title="Delete Section"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}

                                    {section.image && (
                                        <div className="about-image">
                                            <img src={section.image} alt={section.title} />
                                        </div>
                                    )}
                                    <div className="about-text">
                                        <h3>{section.title}</h3>
                                        <p>{section.content}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="about-item">
                                <div className="about-text">
                                    <h3>Creek Crosby</h3>
                                    <p>
                                        Creek Crosby is a rock and roll band performing classic tracks from the 50s era, including Pop, Rock and Roll, Rockabilly, Country, and Blues.
                                    </p>
                                    <p>
                                        Based in Greenock and Gourock, the band is known for their energetic performances and authentic vintage sound. With their debut single "Ashtray's Full, Bottle's Empty", Creek Crosby has been making waves in the local music scene.
                                    </p>
                                    <p>
                                        The band features Gene McTaggart on vocals, Jim Boyd on guitar, Colin McTaggart on keys, Johnny White on bass/vocals, and Jim Duncan on drums. Occasionally joined by Roman Bain on Les Bourbon guitar and Pam McArts on keys.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <EditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={`Edit Section: ${editingSection?.title || ''}`}
                data={editingSection}
                onSave={handleSaveSection}
                fields={sectionFields}
            />

            <EditModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New About Section"
                data={{}}
                onSave={handleSaveSection}
                fields={sectionFields}
            />
        </>
    );
};

export default About;