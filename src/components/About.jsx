import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './About.css';

const About = () => {
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const docRef = doc(db, 'site_content', 'about');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfileImage(docSnap.data().profileImage);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfile();
    }, []);

    return (
        <section id="about" className="section about-section">
            <div className="container">
                <div className="about-content">
                    <div className="about-text">
                        <h2 className="section-title">Sobre Luis</h2>
                        <p className="lead-text">
                            Especializado en el pulso de la ciudad, capturo la energía cruda de la vida nocturna, festivales y eventos exclusivos.
                        </p>
                        <p>
                            Con más de 5 años de experiencia en la escena, sé cómo navegar entre la multitud y encontrar el ángulo perfecto sin interrumpir el flujo. Mi trabajo documenta la atmósfera, las luces y las personas que hacen que cada noche sea única.
                        </p>
                        <p>
                            Desde clubes underground hasta festivales en escenarios principales, entrego visuales de alto impacto que cuentan la historia de la noche.
                        </p>
                        <div className="stats">
                            <div className="stat-item">
                                <span className="stat-number">500+</span>
                                <span className="stat-label">Eventos Cubiertos</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">50+</span>
                                <span className="stat-label">Salas</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">100%</span>
                                <span className="stat-label">Energía</span>
                            </div>
                        </div>
                    </div>
                    <div className="about-image">
                        {profileImage ? (
                            <img src={profileImage} alt="Luis Ivorra" loading="lazy" />
                        ) : (
                            <div className="image-placeholder">
                                <span>DELKAFILMS</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
