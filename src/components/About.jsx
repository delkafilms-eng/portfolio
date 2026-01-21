import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './About.css';

const About = () => {
    const [profileImage, setProfileImage] = useState(null);
    const [imageError, setImageError] = useState(false);

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
                            Especialista en producción audiovisual para artistas y eventos. Transformo momentos efímeros en contenido visual estratégico que fortalece la identidad de marca y amplifica el alcance de tus proyectos.
                        </p>
                        <p>
                            Con más de 5 años de experiencia trabajando con artistas, promotores y marcas, entiendo las necesidades específicas del sector. Mi enfoque combina creatividad cinematográfica con estrategia de contenido, entregando material que no solo documenta, sino que potencia tu presencia digital y profesional.
                        </p>
                        <p>
                            Desde sesiones de artista y backstage hasta cobertura completa de festivales y eventos corporativos, ofrezco soluciones personalizadas que se adaptan a tu visión y objetivos de marca.
                        </p>
                        <div className="stats">
                            <div className="stat-item">
                                <span className="stat-number">500+</span>
                                <span className="stat-label">Proyectos Completados</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">50+</span>
                                <span className="stat-label">Artistas Colaborados</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">100%</span>
                                <span className="stat-label">Compromiso</span>
                            </div>
                        </div>
                    </div>
                    <div className="about-image">
                        {profileImage && !imageError ? (
                            <img
                                src={profileImage}
                                alt="Luis Ivorra"
                                loading="lazy"
                                onError={() => setImageError(true)}
                            />
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
