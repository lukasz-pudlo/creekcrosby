import React from 'react';
import { useInView } from 'react-intersection-observer';
import './About.css';

const About = ({ aboutData }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

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
                                    Lorem ipsum.
                                </p>
                                <p>
                                    Lorem ipsum.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default About;