import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import './Contact.css';

const Contact = ({ contactInfo }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [formStatus, setFormStatus] = useState(null);

    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // This is just a frontend simulation for now
        setFormStatus('loading');

        // Simulate API call
        setTimeout(() => {
            setFormStatus('success');
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
            });
        }, 1500);
    };

    return (
        <section className="contact" id="contact">
            <div className="container">
                <h2 className="section-title">Contact Us</h2>

                <div
                    className={`contact-content ${inView ? 'animate' : ''}`}
                    ref={ref}
                >
                    <div className="contact-info">
                        <h3>Get in Touch</h3>

                        {contactInfo ? (
                            <>
                                <div className="info-item">
                                    <span className="icon">📧</span>
                                    <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                                </div>

                                <div className="info-item">
                                    <span className="icon">📞</span>
                                    <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
                                </div>

                                <div className="info-item">
                                    <span className="icon">📍</span>
                                    <address>{contactInfo.address}</address>
                                </div>

                                <div className="social-links">
                                    {contactInfo.social_facebook && (
                                        <a
                                            href={contactInfo.social_facebook}
                                            aria-label="Facebook"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span className="icon">Facebook</span>
                                        </a>
                                    )}

                                    {contactInfo.social_twitter && (
                                        <a
                                            href={contactInfo.social_twitter}
                                            aria-label="Twitter"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span className="icon">Twitter</span>
                                        </a>
                                    )}

                                    {contactInfo.social_instagram && (
                                        <a
                                            href={contactInfo.social_instagram}
                                            aria-label="Instagram"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span className="icon">Instagram</span>
                                        </a>
                                    )}

                                    {contactInfo.social_linkedin && (
                                        <a
                                            href={contactInfo.social_linkedin}
                                            aria-label="LinkedIn"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span className="icon">LinkedIn</span>
                                        </a>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p>Contact information coming soon.</p>
                        )}
                    </div>

                    <div className="contact-form">
                        <h3>Send us a Message</h3>

                        {formStatus === 'success' ? (
                            <div className="success-message">
                                <p>Thank you for your message! We'll get back to you soon.</p>
                                <button onClick={() => setFormStatus(null)}>Send Another Message</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={formStatus === 'loading'}
                                >
                                    {formStatus === 'loading' ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;