import React, { useState, useEffect, useMemo } from 'react';
import { X, ZoomIn, Play, ChevronDown } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import './Gallery.css';

const ITEMS_PER_PAGE = 20;

const Gallery = () => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [filter, setFilter] = useState('VER TODO');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleItemsCount, setVisibleItemsCount] = useState(ITEMS_PER_PAGE);

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

    // Helper function to normalize category (handle both string and array)
    const normalizeCategories = (category) => {
        if (!category) return [];
        if (Array.isArray(category)) {
            return category.map(c => String(c).trim()).filter(c => c);
        }
        return [String(category).trim()].filter(c => c);
    };

    // Helper function to check if item has category (handles multiple categories)
    const itemHasCategory = (item, categoryName) => {
        const itemCategories = normalizeCategories(item.category);
        return itemCategories.some(cat => 
            cat.toLowerCase() === categoryName.toLowerCase()
        );
    };

    const categories = useMemo(() => {
        if (items.length === 0) return ['VER TODO'];
        
        const allCategories = new Set();
        items.forEach(item => {
            const itemCategories = normalizeCategories(item.category);
            itemCategories.forEach(cat => {
                // Exclude 'Destacados' from gallery categories
                if (cat.toLowerCase() !== 'destacados') {
                    allCategories.add(cat);
                }
            });
        });
        
        return ['VER TODO', ...Array.from(allCategories).sort()];
    }, [items]);

    const filteredItems = useMemo(() => {
        // Exclude 'Destacados' from main gallery display
        const visibleItems = items.filter(item => {
            const itemCategories = normalizeCategories(item.category);
            return !itemCategories.some(cat => cat.toLowerCase() === 'destacados');
        });
        
        if (filter === 'VER TODO') {
            return visibleItems;
        }
        
        // Filter items that have the selected category in any of their categories
        return visibleItems.filter(item => itemHasCategory(item, filter));
    }, [items, filter]);

    // Reset visible count when filter changes
    useEffect(() => {
        setVisibleItemsCount(ITEMS_PER_PAGE);
    }, [filter]);

    const displayedItems = useMemo(() => {
        return filteredItems.slice(0, visibleItemsCount);
    }, [filteredItems, visibleItemsCount]);

    const hasMoreItems = filteredItems.length > visibleItemsCount;

    const handleLoadMore = () => {
        const newCount = visibleItemsCount + ITEMS_PER_PAGE;
        setVisibleItemsCount(newCount);
    };

    if (loading) {
        return <div className="gallery-loading">Cargando portfolio...</div>;
    }

    return (
        <section id="gallery" className="section gallery-section">
            <div className="container">
                <h2 className="section-title">PORTFOLIO</h2>

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
                        <p className="no-items">No hay proyectos en esta categoría aún.</p>
                    ) : (
                        displayedItems.map(item => (
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
                                        <p>{normalizeCategories(item.category).join(', ')}</p>
                                    </div>
                                    <ZoomIn className="zoom-icon" />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {hasMoreItems && (
                    <div className="load-more-container">
                        <button className="load-more-button" onClick={handleLoadMore}>
                            <div className="load-more-content">
                                <span className="load-more-text">Ver más</span>
                                <ChevronDown className="load-more-arrow" size={24} />
                            </div>
                            <div className="load-more-gradient"></div>
                        </button>
                    </div>
                )}
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
                            <p>{normalizeCategories(selectedItem.category).join(', ')}</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Gallery;
