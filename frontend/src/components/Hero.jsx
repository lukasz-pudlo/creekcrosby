import React from 'react';
import './Hero.css';
import bandImage from '../assets/images/ashtray3.jpg';

const Hero = () => {
    return (
        <section
            className="hero"
            id="main"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${bandImage})`
            }}
        >
            <div className="hero-content">
                <h1>Creek Crosby</h1>
                <p>50s Pop, Rock and Roll, Rockabilly, Country, Blues</p>
                <div className="hero-buttons">
                    <a href="#events" className="btn btn-primary">Upcoming Shows</a>
                    <a href="#contact" className="btn btn-outline">Book Us</a>
                </div>
            </div>
        </section>
    );
};

export default Hero;