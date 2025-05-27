import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, editMode, toggleEditMode } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <a href="#main" className="skip-link">Skip to main content</a>
            <div className="container header-container">
                <div className="logo">
                    <a href="/">Creek Crosby</a>
                </div>

                <button
                    className="mobile-menu-toggle"
                    onClick={toggleMobileMenu}
                    aria-expanded={mobileMenuOpen}
                    aria-label="Toggle navigation menu"
                >
                    <span className="hamburger"></span>
                </button>

                <nav className={`nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    <ul className="nav-list">
                        <li><a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a></li>
                        <li><a href="#events" onClick={() => setMobileMenuOpen(false)}>Events</a></li>
                        <li><a href="#band" onClick={() => setMobileMenuOpen(false)}>Band</a></li>
                        <li><a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a></li>

                        {user && (
                            <li>
                                <button
                                    onClick={() => {
                                        document.body.classList.toggle('edit-mode');
                                        const isEditMode = document.body.classList.contains('edit-mode');
                                        const button = document.querySelector('.edit-toggle-btn');
                                        button.textContent = isEditMode ? '✓ Edit Mode ON' : 'Edit Mode';
                                        button.style.backgroundColor = isEditMode ? '#28a745' : 'transparent';
                                        console.log('Edit mode:', isEditMode ? 'ON' : 'OFF');
                                    }}
                                    className="edit-toggle-btn"
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #fff',
                                        color: '#fff',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Edit Mode
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;