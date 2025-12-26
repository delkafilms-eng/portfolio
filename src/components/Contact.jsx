import React from 'react';
import { Mail, Phone, Instagram, Linkedin } from 'lucide-react';
import './Contact.css';

const Contact = () => {
    return (
        <section id="contact" className="section contact-section">
            <div className="container">
                <h2 className="section-title">Contacto</h2>

                <div className="contact-container">
                    <div className="contact-info">
                        <h3>Creemos Algo Juntos</h3>
                        <p>
                            Disponible para proyectos freelance y colaboraciones en todo el mundo.
                            Escríbeme para discutir tu próximo proyecto.
                        </p>

                        <div className="contact-details">
                            <div className="contact-item">
                                <Mail className="contact-icon" />
                                <a href="mailto:delkafilms@gmail.com">delkafilms@gmail.com</a>
                            </div>
                            <div className="contact-item">
                                <Phone className="contact-icon" />
                                <a href="tel:+34601130147">+34 601 13 01 47</a>
                            </div>
                        </div>

                        <div className="social-links">
                            <a href="https://www.instagram.com/delkafilms" target="_blank" rel="noopener noreferrer" className="social-link"><Instagram /></a>
                            <a href="https://www.linkedin.com/in/luisivorra" target="_blank" rel="noopener noreferrer" className="social-link"><Linkedin /></a>
                        </div>
                    </div>

                    <form className="contact-form" action="https://formspree.io/f/mwvezgeo" method="POST">
                        <div className="form-group">
                            <input type="text" name="name" placeholder="Tu Nombre" required />
                        </div>
                        <div className="form-group">
                            <input type="email" name="email" placeholder="Tu Email" required />
                        </div>
                        <div className="form-group">
                            <textarea name="message" placeholder="Cuéntame sobre tu proyecto" rows="5" required></textarea>
                        </div>
                        <button type="submit" className="submit-btn">Enviar Mensaje</button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
