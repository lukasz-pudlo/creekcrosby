import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero" id="main">
            <div className="hero-content">
                <h1>Welcome to Creek Crosby</h1>
                <p>Placeholder text</p>
                <div className="hero-buttons">
                    <a href="#about" className="btn btn-primary">Learn More</a>
                    <a href="#contact" className="btn btn-outline">Contact Us</a>
                </div>
            </div>
        </section>
    );
};

export default Hero;