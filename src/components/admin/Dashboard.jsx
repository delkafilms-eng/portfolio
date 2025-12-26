import React, { useState, useEffect, useMemo } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary } from '../../utils/cloudinaryService';
import { Pencil, X } from 'lucide-react';
import './Admin.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);

    // States for New Work
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);

    // States for Profile
    const [profileFile, setProfileFile] = useState(null);

    const [items, setItems] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null); // ID del item siendo editado
    const [editCategoryValue, setEditCategoryValue] = useState(''); // Valor temporal de la categoría
    const [editingCategoryName, setEditingCategoryName] = useState(null); // Nombre de categoría siendo editada
    const [editCategoryNameValue, setEditCategoryNameValue] = useState(''); // Nuevo nombre de categoría
    const [galleryFilter, setGalleryFilter] = useState('Todas'); // Filtro para la galería actual
    const [editingTitle, setEditingTitle] = useState(null); // ID del item cuyo título se está editando
    const [editTitleValue, setEditTitleValue] = useState(''); // Valor temporal del título

    // Fetch existing items
    useEffect(() => {
        const fetchItems = async () => {
            const q = query(collection(db, 'portfolio_items'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const loadedItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(loadedItems);
        };
        fetchItems();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/admin/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // --- PROFILE HANDLER ---
    const handleProfileUpdate = async () => {
        if (!profileFile) {
            alert("Selecciona una foto primero.");
            return;
        }
        if (!window.confirm("¿Confirmar cambio de foto de perfil?")) return;

        setUploading(true);
        try {
            const data = await uploadToCloudinary(profileFile);
            await setDoc(doc(db, 'site_content', 'about'), {
                profileImage: data.secure_url,
                updatedAt: new Date()
            }, { merge: true });

            alert('¡Foto de perfil actualizada!');
            setProfileFile(null);
        } catch (error) {
            console.error(error);
            alert(`Error al subir perfil: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    // --- WORK UPLOAD HANDLER ---
    const handleFileUpload = async () => {
        if (selectedFiles.length === 0) {
            alert("Selecciona al menos un archivo.");
            return;
        }

        if (!category.trim()) {
            alert("Escribe una categoría.");
            return;
        }

        setUploading(true);
        try {
            const newItems = [];
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const data = await uploadToCloudinary(file);

                // Si hay múltiples archivos y un título, crear títulos secuenciales
                let itemTitle;
                if (selectedFiles.length > 1 && title.trim()) {
                    itemTitle = `${title.trim()}${i + 1}`;
                } else if (selectedFiles.length === 1) {
                    itemTitle = title || 'Sin título';
                } else {
                    itemTitle = '';
                }

                const newItem = {
                    title: itemTitle,
                    category: category.trim(),
                    type: data.resource_type,
                    src: data.secure_url,
                    poster: data.resource_type === 'video' ? data.secure_url.replace(/\.[^/.]+$/, ".jpg") : null,
                    createdAt: new Date()
                };

                const docRef = await addDoc(collection(db, 'portfolio_items'), newItem);
                newItems.push({ id: docRef.id, ...newItem });
            }

            setItems(prevItems => [...newItems, ...prevItems]);
            alert(`¡${selectedFiles.length} archivo(s) subido(s)!`);

            // Clean inputs
            setTitle('');
            setSelectedFiles([]);
            const fileInput = document.getElementById('work-file-input');
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que quieres borrarlo?')) return;
        try {
            await deleteDoc(doc(db, 'portfolio_items', id));
            setItems(items.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const handleEditCategory = (item) => {
        setEditingCategory(item.id);
        setEditCategoryValue(item.category);
    };

    const handleSaveCategory = async (id) => {
        if (!editCategoryValue.trim()) {
            alert('La categoría no puede estar vacía');
            return;
        }
        try {
            await updateDoc(doc(db, 'portfolio_items', id), {
                category: editCategoryValue.trim()
            });
            setItems(items.map(item => 
                item.id === id ? { ...item, category: editCategoryValue.trim() } : item
            ));
            setEditingCategory(null);
            setEditCategoryValue('');
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Error al actualizar la categoría');
        }
    };

    const handleCancelEdit = () => {
        setEditingCategory(null);
        setEditCategoryValue('');
    };

    // Editar título de un item
    const handleEditTitle = (item) => {
        setEditingTitle(item.id);
        setEditTitleValue(item.title || '');
    };

    const handleSaveTitle = async (id) => {
        try {
            await updateDoc(doc(db, 'portfolio_items', id), {
                title: editTitleValue.trim() || ''
            });
            setItems(items.map(item => 
                item.id === id ? { ...item, title: editTitleValue.trim() || '' } : item
            ));
            setEditingTitle(null);
            setEditTitleValue('');
        } catch (error) {
            console.error('Error updating title:', error);
            alert('Error al actualizar el título');
        }
    };

    const handleCancelEditTitle = () => {
        setEditingTitle(null);
        setEditTitleValue('');
    };

    // Calcular estadísticas de categorías
    const categoryStats = useMemo(() => {
        const stats = {};
        items.forEach(item => {
            const cat = item.category || 'Sin categoria';
            if (!stats[cat]) {
                stats[cat] = { photos: 0, videos: 0 };
            }
            // Determinar si es foto o video basado en el tipo
            if (item.type === 'video' || item.type === 'youtube') {
                stats[cat].videos++;
            } else {
                // Por defecto, si no es video, es foto (image o sin tipo)
                stats[cat].photos++;
            }
        });
        return stats;
    }, [items]);

    // Obtener lista de categorías ordenadas
    const categories = useMemo(() => {
        return Object.keys(categoryStats).sort();
    }, [categoryStats]);

    // Filtrar items para la galería según la categoría seleccionada
    const filteredGalleryItems = useMemo(() => {
        if (galleryFilter === 'Todas') {
            return items;
        }
        return items.filter(item => item.category === galleryFilter);
    }, [items, galleryFilter]);

    // Renombrar categoría (actualizar todos los items)
    const handleRenameCategory = async (oldCategoryName, newCategoryName) => {
        if (!newCategoryName.trim()) {
            alert('El nombre de la categoría no puede estar vacío');
            return;
        }
        if (newCategoryName.trim() === oldCategoryName) {
            setEditingCategoryName(null);
            setEditCategoryNameValue('');
            return;
        }

        if (!window.confirm(`¿Renombrar "${oldCategoryName}" a "${newCategoryName.trim()}"? Todos los items se actualizarán.`)) {
            return;
        }

        setUploading(true);
        try {
            const batch = writeBatch(db);
            const itemsToUpdate = items.filter(item => item.category === oldCategoryName);
            
            itemsToUpdate.forEach(item => {
                const itemRef = doc(db, 'portfolio_items', item.id);
                batch.update(itemRef, { category: newCategoryName.trim() });
            });

            await batch.commit();
            
            // Actualizar estado local
            setItems(items.map(item => 
                item.category === oldCategoryName 
                    ? { ...item, category: newCategoryName.trim() }
                    : item
            ));
            
            setEditingCategoryName(null);
            setEditCategoryNameValue('');
            alert(`Categoría renombrada exitosamente. ${itemsToUpdate.length} item(s) actualizado(s).`);
        } catch (error) {
            console.error('Error renaming category:', error);
            alert('Error al renombrar la categoría');
        } finally {
            setUploading(false);
        }
    };

    // Borrar categoría (mover items a "Sin categoria")
    const handleDeleteCategory = async (categoryName) => {
        if (!window.confirm(`¿Borrar la categoría "${categoryName}"? Todos los items se moverán a "Sin categoria".`)) {
            return;
        }

        setUploading(true);
        try {
            const batch = writeBatch(db);
            const itemsToUpdate = items.filter(item => item.category === categoryName);
            
            itemsToUpdate.forEach(item => {
                const itemRef = doc(db, 'portfolio_items', item.id);
                batch.update(itemRef, { category: 'Sin categoria' });
            });

            await batch.commit();
            
            // Actualizar estado local
            setItems(items.map(item => 
                item.category === categoryName 
                    ? { ...item, category: 'Sin categoria' }
                    : item
            ));
            
            alert(`Categoría borrada. ${itemsToUpdate.length} item(s) movido(s) a "Sin categoria".`);
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error al borrar la categoría');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Panel de Luis</h1>
                <button onClick={handleLogout} className="logout-btn">Salir</button>
            </header>

            <div className="admin-content">
                {/* Profile Section */}
                <div className="upload-section profile-section" style={{ borderLeft: '5px solid #007bff' }}>
                    <h2>1. Foto de Perfil</h2>
                    <p className="admin-hint">Esta foto saldrá en la sección "Sobre Luis".</p>
                    <div className="form-group">
                        <label>Seleccionar foto:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProfileFile(e.target.files[0])}
                            disabled={uploading}
                        />
                    </div>
                    <button
                        className="login-box button"
                        style={{ background: '#28a745', width: 'auto', padding: '0.5rem 1rem' }}
                        onClick={handleProfileUpdate}
                        disabled={uploading || !profileFile}
                    >
                        {uploading ? 'Subiendo...' : 'Actualizar Foto Perfil'}
                    </button>
                </div>

                {/* Upload Section */}
                <div className="upload-section">
                    <h2>2. Subir Trabajos a la Galería</h2>

                    <div className="form-group">
                        <label>Categoría (MUUUY IMPORTANTE):</label>
                        <p className="admin-hint">Escribe <strong>Destacados</strong> para que salgan en la sección especial de arriba. Puedes escribir cualquier categoría nueva o seleccionar una existente.</p>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            list="category-options"
                            placeholder="Escribe o selecciona: Destacados, Bodas, Eventos, Vida Nocturna..."
                        />
                        <datalist id="category-options">
                            <option value="Destacados" />
                            {Array.from(new Set(items.map(i => i.category))).map(cat => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                        {category && (
                            <p className="admin-hint" style={{ marginTop: '0.5rem', color: '#28a745' }}>
                                ✅ Categoría: <strong>{category}</strong>
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Título (Opcional):</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Boda en Ibiza"
                        />
                    </div>

                    <div className="form-group">
                        <label>Seleccionar Fotos o Videos:</label>
                        <input
                            id="work-file-input"
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                            disabled={uploading}
                        />
                        <p className="admin-hint" style={{ marginTop: '0.5rem' }}>
                            {selectedFiles.length > 0 ? `✅ ${selectedFiles.length} archivo(s) listo(s)` : 'Ningún archivo seleccionado'}
                        </p>
                    </div>

                    <button
                        className="login-box button"
                        style={{ width: '100%', fontSize: '1.1rem' }}
                        onClick={handleFileUpload}
                        disabled={uploading || selectedFiles.length === 0}
                    >
                        {uploading ? 'Subiendo...' : 'SUBIR AHORA'}
                    </button>
                </div>

                {/* YouTube Section */}
                <div className="upload-section">
                    <h2>3. Añadir Video de YouTube</h2>
                    <p className="admin-hint">Pega aquí el enlace (normal o Short).</p>

                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="https://youtube.com/shorts/..."
                            id="youtube-url-input"
                        />
                    </div>
                    {/* Reusing existing states for category/title */}
                    <button
                        className="login-box button"
                        style={{ width: '100%', marginTop: '1rem', background: '#ff0000' }}
                        onClick={async () => {
                            const urlInput = document.getElementById('youtube-url-input');
                            const url = urlInput.value.trim();
                            if (!url) return;

                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                            const match = url.match(regExp);
                            const shortMatch = url.match(/shorts\/([\w-]{11})/);
                            const videoId = (match && match[2].length === 11) ? match[2] : (shortMatch ? shortMatch[1] : null);

                            if (!videoId) { alert("Link inválido"); return; }
                            if (!category.trim()) { alert("Pon una categoría (ej: Destacados)"); return; }

                            setUploading(true);
                            try {
                                const newItem = {
                                    title: title || 'Video YouTube',
                                    category: category,
                                    type: 'youtube',
                                    src: videoId,
                                    poster: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                                    createdAt: new Date()
                                };
                                const docRef = await addDoc(collection(db, 'portfolio_items'), newItem);
                                setItems([{ id: docRef.id, ...newItem }, ...items]);
                                alert('¡Video YouTube añadido!');
                                urlInput.value = '';
                            } catch (err) { console.error(err); } finally { setUploading(false); }
                        }}
                        disabled={uploading}
                    >
                        Guardar YouTube
                    </button>
                </div>

                {/* Categories Management Table */}
                <div className="upload-section" style={{ borderLeft: '5px solid #ffc107' }}>
                    <h2>4. Gestión de Categorías</h2>
                    <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                        <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 'bold' }}>Categoría</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Fotos</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Videos</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                                            No hay categorías aún
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map(cat => (
                                        <tr key={cat} style={{ borderBottom: '1px solid #dee2e6' }}>
                                            <td style={{ padding: '1rem' }}>
                                                {editingCategoryName === cat ? (
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={editCategoryNameValue}
                                                            onChange={(e) => setEditCategoryNameValue(e.target.value)}
                                                            style={{
                                                                padding: '0.5rem',
                                                                fontSize: '1rem',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                flex: 1
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleRenameCategory(cat, editCategoryNameValue);
                                                                if (e.key === 'Escape') {
                                                                    setEditingCategoryName(null);
                                                                    setEditCategoryNameValue('');
                                                                }
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleRenameCategory(cat, editCategoryNameValue)}
                                                            style={{
                                                                padding: '0.5rem',
                                                                background: '#28a745',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                            disabled={uploading}
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingCategoryName(null);
                                                                setEditCategoryNameValue('');
                                                            }}
                                                            style={{
                                                                padding: '0.5rem',
                                                                background: '#6c757d',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <strong style={{ fontSize: '1.1rem' }}>{cat}</strong>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <span style={{ 
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.75rem',
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#1976d2',
                                                    borderRadius: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {categoryStats[cat].photos}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <span style={{ 
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.75rem',
                                                    backgroundColor: '#fce4ec',
                                                    color: '#c2185b',
                                                    borderRadius: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {categoryStats[cat].videos}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    {editingCategoryName !== cat && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingCategoryName(cat);
                                                                    setEditCategoryNameValue(cat);
                                                                }}
                                                                style={{
                                                                    padding: '0.5rem',
                                                                    background: '#007bff',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.25rem'
                                                                }}
                                                                disabled={uploading}
                                                                title="Editar nombre de categoría"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCategory(cat)}
                                                                style={{
                                                                    padding: '0.5rem',
                                                                    background: '#dc3545',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.25rem'
                                                                }}
                                                                disabled={uploading}
                                                                title="Borrar categoría"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="gallery-manager">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0 }}>5. Galería Actual ({filteredGalleryItems.length} de {items.length})</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label htmlFor="gallery-category-filter" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                Filtrar por categoría:
                            </label>
                            <select
                                id="gallery-category-filter"
                                value={galleryFilter}
                                onChange={(e) => setGalleryFilter(e.target.value)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    fontSize: '1rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    minWidth: '200px'
                                }}
                            >
                                <option value="Todas">Todas las categorías</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat} ({categoryStats[cat].photos + categoryStats[cat].videos} items)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="admin-grid">
                        {filteredGalleryItems.length === 0 ? (
                            <div style={{ 
                                gridColumn: '1 / -1', 
                                textAlign: 'center', 
                                padding: '3rem',
                                color: '#6c757d'
                            }}>
                                <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No hay items en esta categoría</p>
                                <p style={{ fontSize: '0.9rem' }}>Selecciona otra categoría o sube nuevos archivos</p>
                            </div>
                        ) : (
                            filteredGalleryItems.map(item => (
                            <div key={item.id} className="admin-item">
                                {item.type === 'video' ? (
                                    <video src={item.src} className="admin-thumb" />
                                ) : item.type === 'youtube' ? (
                                    <img src={item.poster} className="admin-thumb" alt="yt" />
                                ) : (
                                    <img src={item.src} alt={item.title} className="admin-thumb" />
                                )}
                                <div className="admin-item-info">
                                    {editingTitle === item.id ? (
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <input
                                                type="text"
                                                value={editTitleValue}
                                                onChange={(e) => setEditTitleValue(e.target.value)}
                                                style={{
                                                    padding: '0.4rem 0.6rem',
                                                    fontSize: '0.95rem',
                                                    width: '100%',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    marginBottom: '0.5rem'
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveTitle(item.id);
                                                    if (e.key === 'Escape') handleCancelEditTitle();
                                                }}
                                                autoFocus
                                                placeholder="Título del archivo"
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleSaveTitle(item.id)}
                                                    style={{
                                                        padding: '0.3rem 0.6rem',
                                                        background: '#28a745',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        flex: 1
                                                    }}
                                                >
                                                    ✓ Guardar
                                                </button>
                                                <button
                                                    onClick={handleCancelEditTitle}
                                                    style={{
                                                        padding: '0.3rem 0.6rem',
                                                        background: '#6c757d',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                        flex: 1
                                                    }}
                                                >
                                                    ✕ Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p 
                                            style={{ 
                                                cursor: 'pointer',
                                                marginBottom: '0.5rem',
                                                padding: '0.25rem',
                                                borderRadius: '4px',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                            onClick={() => handleEditTitle(item)}
                                            title="Haz clic para editar el título"
                                        >
                                            <strong>{item.title || 'Sin título'}</strong>
                                        </p>
                                    )}
                                    {editingCategory === item.id ? (
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                                <select
                                                    value={editCategoryValue}
                                                    onChange={(e) => setEditCategoryValue(e.target.value)}
                                                    style={{ 
                                                        padding: '0.25rem 0.5rem', 
                                                        fontSize: '0.9rem',
                                                        flex: 1,
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveCategory(item.id);
                                                        if (e.key === 'Escape') handleCancelEdit();
                                                    }}
                                                    autoFocus
                                                >
                                                    <option value="">Selecciona una categoría...</option>
                                                    {Array.from(new Set(items.map(i => i.category))).sort().map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    value={editCategoryValue}
                                                    onChange={(e) => setEditCategoryValue(e.target.value)}
                                                    placeholder="O escribe nueva categoría"
                                                    style={{ 
                                                        padding: '0.25rem 0.5rem', 
                                                        fontSize: '0.9rem',
                                                        flex: 1,
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px'
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleSaveCategory(item.id);
                                                        if (e.key === 'Escape') handleCancelEdit();
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                                <button 
                                                    onClick={() => handleSaveCategory(item.id)}
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        background: '#28a745',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        flex: 1
                                                    }}
                                                >
                                                    ✓ Guardar
                                                </button>
                                                <button 
                                                    onClick={handleCancelEdit}
                                                    style={{
                                                        padding: '0.4rem 0.8rem',
                                                        background: '#6c757d',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        flex: 1
                                                    }}
                                                >
                                                    ✕ Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="category-tag">{item.category}</p>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        {editingCategory !== item.id && (
                                            <button 
                                                onClick={() => handleEditCategory(item)} 
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    background: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Editar Categoría
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(item.id)} 
                                            className="delete-btn"
                                            style={{ flex: 1 }}
                                        >
                                            Borrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
