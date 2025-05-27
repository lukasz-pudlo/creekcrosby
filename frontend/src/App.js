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
import './App.css';

function AppContent() {
    const [events, setEvents] = useState([]);
    const [band, setBand] = useState([]);
    const [about, setAbout] = useState([]);
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        fetchData();
    }, []);

    const handleEventsUpdate = async () => {
        try {
            const response = await axios.get('/api/events/');
            setEvents(response.data);
        } catch (err) {
            console.error('Error updating events:', err);
        }
    };

    const handleBandUpdate = async () => {
        try {
            const response = await axios.get('/api/band/');
            setBand(response.data);
        } catch (err) {
            console.error('Error updating band:', err);
        }
    };

    const handleAboutUpdate = async () => {
        try {
            const response = await axios.get('/api/about/');
            setAbout(response.data);
        } catch (err) {
            console.error('Error updating about:', err);
        }
    };

    return (
        <div className="app">
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
                            onAboutUpdate={handleAboutUpdate}
                        />
                        <Events
                            events={events}
                            onEventsUpdate={handleEventsUpdate}
                        />
                        <Band
                            band={band}
                            onBandUpdate={handleBandUpdate}
                        />
                        <Contact contactInfo={contact} />
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