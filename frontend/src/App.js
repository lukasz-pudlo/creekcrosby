import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Events from './components/Events';
import Band from './components/Band';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './App.css';

function App() {
    const [events, setEvents] = useState([]);
    const [band, setBand] = useState([]);
    const [about, setAbout] = useState([]);
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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

        fetchData();
    }, []);

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
                        <About aboutData={about} />
                        <Events events={events} />
                        <Band band={band} />
                        <Contact contactInfo={contact} />
                    </>
                )}
            </main>
            <Footer contactInfo={contact} />
        </div>
    );
}

export default App;