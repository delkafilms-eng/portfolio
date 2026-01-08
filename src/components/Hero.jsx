import React from 'react';
import { ChevronDown } from 'lucide-react';
import './Hero.css';

const Hero = () => {
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
                <a href="#gallery" className="cta-button">
                    Ver Portfolio
                </a>
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
