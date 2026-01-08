import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './FeaturedVideos.css';

const FeaturedVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Fetch ALL items to get all "Destacados" (no limit)
                const q = query(
                    collection(db, 'portfolio_items'),
                    orderBy('createdAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const allItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Filter for "Destacados" (case-insensitive match)
                const featured = allItems.filter(item => {
                    const category = item.category ? item.category.trim() : '';
                    return category.toLowerCase() === 'destacados';
                });

                console.log("Total items:", allItems.length);
                console.log("Found Destacados:", featured.length, featured); // Debugging
                setVideos(featured);
            } catch (error) {
                console.error("Error fetching featured videos:", error);
                // Si falla el orderBy, intentar sin orden
                try {
                    const q = query(collection(db, 'portfolio_items'));
                    const querySnapshot = await getDocs(q);
                    const allItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    const featured = allItems.filter(item => {
                        const category = item.category ? item.category.trim() : '';
                        return category.toLowerCase() === 'destacados';
                    });
                    console.log("Fallback - Found Destacados:", featured.length, featured);
                    setVideos(featured);
                } catch (fallbackError) {
                    console.error("Fallback error:", fallbackError);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    // No usar fallback, mostrar solo los videos reales de la base de datos
    const content = videos;

    if (loading) return null;

    // Debug: mostrar cuántos videos se encontraron
    if (content.length === 0) {
        console.warn("No se encontraron videos destacados en la base de datos");
    } else {
        console.log(`Mostrando ${content.length} video(s) destacado(s)`);
    }

    return (
        <section className="section featured-section">
            <div className="container">
                <h2 className="section-title">TRABAJOS DESTACADOS</h2>
                <div className="featured-grid">
                    {content.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const VideoCard = ({ video }) => {
    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div
            className="featured-card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={`video-overlay ${isHovered ? 'hidden' : ''}`}>
                <div className="overlay-content">
                    <h3>{video.title}</h3>
                    <p>Ver Video</p>
                </div>
            </div>

            {video.type === 'youtube' ? (
                <div className="youtube-wrapper">
                    {isHovered ? (
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${video.src}?autoplay=1&mute=0&controls=0&loop=1&playlist=${video.src}`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="featured-video-iframe"
                        ></iframe>
                    ) : (
                        <img
                            src={video.poster || `https://img.youtube.com/vi/${video.src}/hqdefault.jpg`}
                            alt={video.title}
                            className="featured-video poster-img"
                        />
                    )}
                </div>
            ) : (
                <video
                    ref={videoRef}
                    src={video.src}
                    className="featured-video"
                    loop
                    // muted removed to enable audio
                    playsInline
                    poster={video.poster}
                />
            )}
        </div>
    );
};

export default FeaturedVideos;
