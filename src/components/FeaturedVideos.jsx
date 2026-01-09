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

                // Helper function to normalize category (handle both string and array)
                const normalizeCategories = (category) => {
                    if (!category) return [];
                    if (Array.isArray(category)) {
                        return category.map(c => String(c).trim()).filter(c => c);
                    }
                    return [String(category).trim()].filter(c => c);
                };

                // Filter for "Destacados" (case-insensitive match, supports multiple categories)
                const featured = allItems.filter(item => {
                    const itemCategories = normalizeCategories(item.category);
                    return itemCategories.some(cat => cat.toLowerCase() === 'destacados');
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
                    
                    const normalizeCategories = (category) => {
                        if (!category) return [];
                        if (Array.isArray(category)) {
                            return category.map(c => String(c).trim()).filter(c => c);
                        }
                        return [String(category).trim()].filter(c => c);
                    };
                    
                    const featured = allItems.filter(item => {
                        const itemCategories = normalizeCategories(item.category);
                        return itemCategories.some(cat => cat.toLowerCase() === 'destacados');
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
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detectar si es dispositivo móvil/tablet
        const checkMobile = () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   ('ontouchstart' in window) ||
                   (navigator.maxTouchPoints > 0);
        };
        setIsMobile(checkMobile());
    }, []);

    const handlePlay = () => {
        setIsPlaying(true);
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
        }
    };

    const handlePause = () => {
        setIsPlaying(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    const handleMouseEnter = () => {
        if (!isMobile) {
            handlePlay();
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            handlePause();
        }
    };

    const handleClick = () => {
        if (isMobile) {
            if (isPlaying) {
                handlePause();
            } else {
                handlePlay();
            }
        }
    };

    const handleVideoClick = (e) => {
        if (isMobile && video.type !== 'youtube') {
            e.stopPropagation();
            if (isPlaying) {
                handlePause();
            } else {
                handlePlay();
            }
        }
    };

    return (
        <div
            className="featured-card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <div className={`video-overlay ${isPlaying ? 'hidden' : ''}`}>
                <div className="overlay-content">
                    <h3>{video.title}</h3>
                    <p>{isMobile ? 'Toca para reproducir' : 'Ver Video'}</p>
                </div>
            </div>

            {isMobile && isPlaying && (
                <button 
                    className="pause-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePause();
                    }}
                    aria-label="Pausar video"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                </button>
            )}

            {video.type === 'youtube' ? (
                <div className="youtube-wrapper">
                    {isPlaying ? (
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${video.src}?autoplay=1&mute=0&controls=1&loop=1&playlist=${video.src}`}
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
                    playsInline
                    poster={video.poster}
                    onClick={handleVideoClick}
                    controls={isMobile && isPlaying}
                />
            )}
        </div>
    );
};

export default FeaturedVideos;
