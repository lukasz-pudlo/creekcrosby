import React from 'react';
import './Footer.css';

const Footer = ({ contactInfo }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-logo">
                        <h3>Creek Crosby</h3>
                        <p>Footer text placeholder</p>
                    </div>

                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#events">Events</a></li>
                            <li><a href="#band">Band Members</a></li>
                            <li><a href="#contact">Contact</a></li>
                        </ul>
                    </div>

                    <div className="footer-contact">
                        <h4>Contact Us</h4>
                        {contactInfo ? (
                            <ul>
                                <li><a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></li>
                                <li><a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a></li>
                                <li><address>{contactInfo.address}</address></li>
                            </ul>
                        ) : (
                            <p>Contact information coming soon.</p>
                        )}
                    </div>

                    <div className="footer-social">
                        <h4>Follow Us</h4>
                        <div className="social-icons">
                            {contactInfo?.social_facebook && (
                                <a
                                    href={contactInfo.social_facebook}
                                    aria-label="Facebook"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="icon">Facebook</span>
                                </a>
                            )}

                            {contactInfo?.social_twitter && (
                                <a
                                    href={contactInfo.social_twitter}
                                    aria-label="Twitter"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="icon">Twitter</span>
                                </a>
                            )}

                            {contactInfo?.social_instagram && (
                                <a
                                    href={contactInfo.social_instagram}
                                    aria-label="Instagram"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="icon">Instagram</span>
                                </a>
                            )}

                            {contactInfo?.social_linkedin && (
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
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} Creek Crosby. All rights reserved.</p>
                    <div className="footer-legal">
                        <a href="/privacy">Privacy Policy</a>
                        <a href="/terms">Terms of Service</a>
                        <a href="/cookies">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;