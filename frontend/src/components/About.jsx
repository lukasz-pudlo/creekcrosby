import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import EditableText from './EditableText';
import EditableImage from './EditableImage';
import './About.css';

const About = ({ aboutData, onDataUpdate }) => {
    const { isStaff } = useAuth();
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const handleSaveText = async (sectionId, field, newValue) => {
        try {
            const response = await axios.patch(`/api/about/${sectionId}/`, {
                [field]: newValue
            });

            // Update local state
            if (onDataUpdate) {
                onDataUpdate(response.data);
            }
        } catch (error) {
            console.error('Error updating about section:', error);
            throw error;
        }
    };

    const handleSaveImage = async (sectionId, imageData) => {
        try {
            const response = await axios.patch(`/api/about/${sectionId}/`, imageData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update local state
            if (onDataUpdate) {
                onDataUpdate(response.data);
            }
        } catch (error) {
            console.error('Error updating image:', error);
            throw error;
        }
    };

    const handleAddSection = async () => {
        try {
            const response = await axios.post('/api/about/', {
                title: 'New Section',
                content: 'Click to edit this content...'
            });

            // Update local state
            if (onDataUpdate) {
                onDataUpdate(response.data);
            }
        } catch (error) {
            console.error('Error adding section:', error);
            alert('Failed to add new section.');
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!window.confirm('Are you sure you want to delete this section?')) {
            return;
        }

        try {
            await axios.delete(`/api/about/${sectionId}/`);

            // Update local state
            if (onDataUpdate) {
                onDataUpdate(null, sectionId); // Signal deletion
            }
        } catch (error) {
            console.error('Error deleting section:', error);
            alert('Failed to delete section.');
        }
    };

    return (
        <section className="about" id="about">
            <div className="container">
                <h2 className="section-title">About Us</h2>

                <div
                    className={`about-content ${inView ? 'animate' : ''}`}
                    ref={ref}
                >
                    {aboutData && aboutData.length > 0 ? (
                        aboutData.map((section, index) => (
                            <div key={section.id} className={`about-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                                {isStaff && (
                                    <button
                                        className="delete-section-btn"
                                        onClick={() => handleDeleteSection(section.id)}
                                        title="Delete section"
                                    >
                                        ×
                                    </button>
                                )}

                                <EditableImage
                                    src={section.image}
                                    alt={section.title}
                                    onSave={(imageData) => handleSaveImage(section.id, imageData)}
                                    className="about-image"
                                    placeholder="Add section image"
                                />

                                <div className="about-text">
                                    <EditableText
                                        text={section.title}
                                        onSave={(newValue) => handleSaveText(section.id, 'title', newValue)}
                                        tag="h3"
                                        placeholder="Section title..."
                                    />
                                    <EditableText
                                        text={section.content}
                                        onSave={(newValue) => handleSaveText(section.id, 'content', newValue)}
                                        tag="p"
                                        placeholder="Section content..."
                                        multiline={true}
                                    />
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

                    {isStaff && (
                        <div className="staff-actions">
                            <button
                                className="add-section-btn"
                                onClick={handleAddSection}
                            >
                                + Add New Section
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default About;