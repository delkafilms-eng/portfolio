import React from 'react';
import { ChevronDown } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    const handleScrollToGallery = (e) => {
        e.preventDefault();
        const galleryElement = document.getElementById('gallery');
        if (galleryElement) {
            galleryElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const handleScrollToContact = (e) => {
        e.preventDefault();
        const contactElement = document.getElementById('contact');
        if (contactElement) {
            contactElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <section className="hero">
            <div className="hero-content container">
                <h2 className="hero-subtitle">Fotografía y Video Profesional para Artistas y Eventos</h2>
                <h1 className="hero-title">
                    ELEVA TU <br />
                    <span className="text-gradient">MARCA</span>
                </h1>
                <p className="hero-description">
                    Servicios profesionales de fotografía y video para artistas, festivales y eventos. Capturamos la esencia de tu marca con contenido visual de alto impacto que conecta con tu audiencia y potencia tu presencia digital.
                </p>
                <div className="cta-buttons">
                    <a href="#gallery" className="cta-button" onClick={handleScrollToGallery}>
                        Ver Portfolio
                    </a>
                    <a href="#contact" className="cta-button cta-button-secondary" onClick={handleScrollToContact}>
                        Contactar
                    </a>
                </div>
            </div>

            <div className="scroll-indicator">
                <span>EXPLORA MIS SERVICIOS</span>
                <ChevronDown className="bounce" />
            </div>

            {/* Background overlay/image placeholder */}
            <div className="hero-background"></div>
        </section>
    );
};

export default Hero;
