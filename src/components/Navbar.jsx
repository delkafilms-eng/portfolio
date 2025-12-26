import React, { useState, useEffect } from 'react';
import { Menu, X, Camera } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-container">
                <a href="#" className="logo">
                    <Camera size={24} className="logo-icon" />
                    <span>DELKAFILMS</span>
                </a>

                <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                    <a href="#gallery" onClick={() => setIsOpen(false)}>Portfolio</a>
                    <a href="#about" onClick={() => setIsOpen(false)}>Sobre Mí</a>
                    <a href="#contact" onClick={() => setIsOpen(false)}>Contacto</a>
                </div>

                <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
