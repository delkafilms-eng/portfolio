import React, { useState, useEffect, useMemo } from 'react';
import { X, ZoomIn, Play } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import './Gallery.css';

const Gallery = () => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [filter, setFilter] = useState('VER TODO');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch items from Firestore
    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const q = query(collection(db, 'portfolio_items'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setItems(data);
            } catch (error) {
                console.error("Error fetching portfolio:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, []);

    const categories = useMemo(() => {
        if (items.length === 0) return ['VER TODO'];
        // Exclude 'Destacados' from gallery categories (case insensitive)
        const visibleItems = items.filter(i => i.category.trim().toLowerCase() !== 'destacados');
        const cats = new Set(visibleItems.map(item => item.category));
        return ['VER TODO', ...Array.from(cats)];
    }, [items]);

    const filteredItems = useMemo(() => {
        // Exclude 'Destacados' from main gallery display
        const visibleItems = items.filter(i => i.category.trim().toLowerCase() !== 'destacados');
        return filter === 'VER TODO'
            ? visibleItems
            : visibleItems.filter(item => item.category === filter);
    }, [items, filter]);

    if (loading) {
        return <div className="gallery-loading">Cargando trabajos...</div>;
    }

    return (
        <section id="gallery" className="section gallery-section">
            <div className="container">
                <h2 className="section-title">MIS TRABAJOS</h2>

                <div className="filter-buttons">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`filter-btn ${filter === cat ? 'active' : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="gallery-grid">
                    {filteredItems.length === 0 ? (
                        <p className="no-items">No hay trabajos en esta categoría aún.</p>
                    ) : (
                        filteredItems.map(item => (
                            <div key={item.id} className="gallery-item" onClick={() => setSelectedItem(item)}>
                                {item.type === 'video' || item.type === 'youtube' ? (
                                    <div className="video-thumbnail">
                                        <img src={item.poster || item.src.replace(/\.[^/.]+$/, ".jpg")} alt={item.title} loading="lazy" />
                                        <div className="play-icon-overlay">
                                            <Play size={48} fill="currentColor" />
                                        </div>
                                    </div>
                                ) : (
                                    <img src={item.src} alt={item.title} loading="lazy" />
                                )}

                                <div className="item-overlay">
                                    <div className="item-info">
                                        <h3>{item.title}</h3>
                                        <p>{item.category}</p>
                                    </div>
                                    <ZoomIn className="zoom-icon" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedItem && (
                <div className="lightbox" onClick={() => setSelectedItem(null)}>
                    <button className="close-lightbox">
                        <X size={32} />
                    </button>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        {selectedItem.type === 'video' ? (
                            <video
                                src={selectedItem.src}
                                controls
                                autoPlay
                                className="lightbox-video"
                            />
                        ) : selectedItem.type === 'youtube' ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${selectedItem.src}?autoplay=1&rel=0`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="lightbox-video"
                                title={selectedItem.title}
                            ></iframe>
                        ) : (
                            <img src={selectedItem.src} alt={selectedItem.title} />
                        )}
                        <div className="lightbox-caption">
                            <h3>{selectedItem.title}</h3>
                            <p>{selectedItem.category}</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Gallery;
