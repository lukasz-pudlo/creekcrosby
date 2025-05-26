import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import './Events.css';

const Events = ({ events, onEventsUpdate }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    // Check if we're in edit mode by looking at body class
    const [editMode, setEditMode] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);

    // Check edit mode from body class
    React.useEffect(() => {
        const checkEditMode = () => {
            setEditMode(document.body.classList.contains('edit-mode'));
        };

        // Check immediately
        checkEditMode();

        // Set up observer to watch for changes
        const observer = new MutationObserver(checkEditMode);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setFormData({ ...event });
        setShowEditModal(true);
    };

    const handleAddEvent = () => {
        setEditingEvent(null);
        setFormData({
            title: '',
            description: '',
            date: '',
            location: '',
            image: null
        });
        setShowAddModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value, type, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value
        }));
    };

    const handleSaveEvent = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const eventData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    eventData.append(key, formData[key]);
                }
            });

            if (editingEvent) {
                // Update existing event
                await axios.patch(`/api/events/${editingEvent.id}/`, eventData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Create new event
                await axios.post('/api/events/', eventData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // Refresh events data
            if (onEventsUpdate) {
                onEventsUpdate();
            }

            setShowEditModal(false);
            setShowAddModal(false);
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save event: ' + (error.response?.data?.detail || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await axios.delete(`/api/events/${eventId}/`);
                if (onEventsUpdate) {
                    onEventsUpdate();
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('Failed to delete event');
            }
        }
    };

    const closeModal = () => {
        setShowEditModal(false);
        setShowAddModal(false);
        setEditingEvent(null);
        setFormData({});
    };

    // Simple modal component
    const EditModal = ({ isOpen, title, onClose, onSave }) => {
        if (!isOpen) return null;

        return (
            <div style={{
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
            }} onClick={onClose}>
                <div style={{
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    padding: '2rem',
                    borderRadius: '8px',
                    width: '90%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflow: 'auto'
                }} onClick={e => e.stopPropagation()}>
                    <h3 style={{ color: '#ff0000', marginBottom: '1.5rem' }}>{title}</h3>

                    <form onSubmit={onSave}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Event Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title || ''}
                                onChange={handleFormChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: '#333',
                                    color: '#fff',
                                    border: '1px solid #555',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleFormChange}
                                required
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: '#333',
                                    color: '#fff',
                                    border: '1px solid #555',
                                    borderRadius: '4px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Date & Time *
                            </label>
                            <input
                                type="datetime-local"
                                name="date"
                                value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ''}
                                onChange={handleFormChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: '#333',
                                    color: '#fff',
                                    border: '1px solid #555',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location || ''}
                                onChange={handleFormChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: '#333',
                                    color: '#fff',
                                    border: '1px solid #555',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Event Image
                            </label>
                            <input
                                type="file"
                                name="image"
                                onChange={handleFormChange}
                                accept="image/*"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: '#333',
                                    color: '#fff',
                                    border: '1px solid #555',
                                    borderRadius: '4px'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: 'transparent',
                                    color: '#fff',
                                    border: '1px solid #555',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#ff0000',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {loading ? 'Saving...' : 'Save Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <>
            <section className={`events ${editMode ? 'edit-mode' : ''}`} id="events">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                        <h2 className="section-title">Upcoming Events</h2>
                        {editMode && (
                            <button
                                onClick={handleAddEvent}
                                style={{
                                    backgroundColor: '#ff0000',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}
                            >
                                + Add Event
                            </button>
                        )}
                    </div>

                    <div
                        className={`events-grid ${inView ? 'animate' : ''}`}
                        ref={ref}
                    >
                        {events && events.length > 0 ? (
                            events.map((event) => (
                                <div key={event.id} className="event-card" style={{ position: 'relative' }}>
                                    {editMode && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            display: 'flex',
                                            gap: '0.5rem',
                                            opacity: editMode ? 1 : 0,
                                            transition: 'opacity 0.3s ease',
                                            zIndex: 10
                                        }}>
                                            <button
                                                onClick={() => handleEditEvent(event)}
                                                title="Edit Event"
                                                style={{
                                                    backgroundColor: 'rgba(255, 0, 0, 0.8)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '0.5rem',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                title="Delete Event"
                                                style={{
                                                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '0.5rem',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}

                                    {event.image && (
                                        <div className="event-image">
                                            <img src={event.image} alt={event.title} />
                                        </div>
                                    )}
                                    <div className="event-content">
                                        <h3 className="event-title">{event.title}</h3>
                                        <div className="event-details">
                                            <p className="event-date">
                                                <span className="icon">📅</span> {formatDate(event.date)}
                                            </p>
                                            <p className="event-time">
                                                <span className="icon">🕒</span> {formatTime(event.date)}
                                            </p>
                                            <p className="event-location">
                                                <span className="icon">📍</span> {event.location}
                                            </p>
                                        </div>
                                        <p className="event-description">{event.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-events">
                                <p>Upcoming shows:</p>
                                <div className="event-card">
                                    <div className="event-content">
                                        <h3 className="event-title">Live at Blackfriars, Glasgow</h3>
                                        <div className="event-details">
                                            <p className="event-date">
                                                <span className="icon">📅</span> August 6th and September 24th
                                            </p>
                                            <p className="event-time">
                                                <span className="icon">🕒</span> Doors open from 21:00
                                            </p>
                                            <p className="event-location">
                                                <span className="icon">📍</span> Blackfriars, Glasgow
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <EditModal
                isOpen={showEditModal}
                title={`Edit Event: ${editingEvent?.title || ''}`}
                onClose={closeModal}
                onSave={handleSaveEvent}
            />

            <EditModal
                isOpen={showAddModal}
                title="Add New Event"
                onClose={closeModal}
                onSave={handleSaveEvent}
            />
        </>
    );
};

export default Events;