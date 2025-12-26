import React from 'react';
import { ChevronDown } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-content container">
                <h2 className="hero-subtitle">Fotografía de Eventos y Vida Nocturna</h2>
                <h1 className="hero-title">
                    DUEÑO DE LA <br />
                    <span className="text-gradient">NOCHE</span>
                </h1>
                <p className="hero-description">
                    Capturando la energía del momento. Te ayudo a dar vida a la atmósfera de tu evento a través de visuales cinematográficos.
                </p>
                <a href="#gallery" className="cta-button">
                    Ver Eventos
                </a>
            </div>

            <div className="scroll-indicator">
                <span>DESCUBRE MÁS</span>
                <ChevronDown className="bounce" />
            </div>

            {/* Background overlay/image placeholder */}
            <div className="hero-background"></div>
        </section>
    );
};

export default Hero;
