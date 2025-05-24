import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Events from './components/Events';
import Band from './components/Band';
import Contact from './components/Contact';
import Footer from './components/Footer';
import StaffIndicator from './components/StaffIndicator';
import './App.css';

function AppContent() {
    const [events, setEvents] = useState([]);
    const [band, setBand] = useState([]);
    const [about, setAbout] = useState([]);
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [eventsRes, bandRes, aboutRes, contactRes] = await Promise.all([
                axios.get('/api/events/'),
                axios.get('/api/band/'),
                axios.get('/api/about/'),
                axios.get('/api/contact/')
            ]);

            setEvents(eventsRes.data);
            setBand(bandRes.data);
            setAbout(aboutRes.data);
            setContact(contactRes.data.length > 0 ? contactRes.data[0] : null);

            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load content. Please try again later.');
            setLoading(false);
        }
    };

    const handleAboutUpdate = (updatedSection, deletedId = null) => {
        if (deletedId) {
            // Remove deleted section
            setAbout(prev => prev.filter(section => section.id !== deletedId));
        } else if (updatedSection) {
            // Update or add section
            setAbout(prev => {
                const existingIndex = prev.findIndex(section => section.id === updatedSection.id);
                if (existingIndex >= 0) {
                    // Update existing
                    const newAbout = [...prev];
                    newAbout[existingIndex] = updatedSection;
                    return newAbout;
                } else {
                    // Add new
                    return [...prev, updatedSection];
                }
            });
        }
    };

    const handleEventsUpdate = (updatedEvent, deletedId = null) => {
        if (deletedId) {
            setEvents(prev => prev.filter(event => event.id !== deletedId));
        } else if (updatedEvent) {
            setEvents(prev => {
                const existingIndex = prev.findIndex(event => event.id === updatedEvent.id);
                if (existingIndex >= 0) {
                    const newEvents = [...prev];
                    newEvents[existingIndex] = updatedEvent;
                    return newEvents;
                } else {
                    return [...prev, updatedEvent];
                }
            });
        }
    };

    const handleBandUpdate = (updatedMember, deletedId = null) => {
        if (deletedId) {
            setBand(prev => prev.filter(member => member.id !== deletedId));
        } else if (updatedMember) {
            setBand(prev => {
                const existingIndex = prev.findIndex(member => member.id === updatedMember.id);
                if (existingIndex >= 0) {
                    const newBand = [...prev];
                    newBand[existingIndex] = updatedMember;
                    return newBand;
                } else {
                    return [...prev, updatedMember];
                }
            });
        }
    };

    const handleContactUpdate = (updatedContact) => {
        setContact(updatedContact);
    };

    return (
        <div className="app">
            <StaffIndicator />
            <Header />
            <main>
                <Hero />

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : (
                    <>
                        <About
                            aboutData={about}
                            onDataUpdate={handleAboutUpdate}
                        />
                        <Events
                            events={events}
                            onDataUpdate={handleEventsUpdate}
                        />
                        <Band
                            band={band}
                            onDataUpdate={handleBandUpdate}
                        />
                        <Contact
                            contactInfo={contact}
                            onDataUpdate={handleContactUpdate}
                        />
                    </>
                )}
            </main>
            <Footer contactInfo={contact} />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;