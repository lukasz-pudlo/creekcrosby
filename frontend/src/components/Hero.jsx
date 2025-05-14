import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero" id="main">
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