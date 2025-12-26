import axios from 'axios';

// Keys moved to .env
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    // Optional: Add tags or folders
    // formData.append('folder', 'portfolio_luis');

    try {
        // 'auto' detects image vs video
        // Increased timeout for large video uploads (default is often too short)
        const isVideo = file.type?.startsWith('video/');
        const timeout = isVideo ? 300000 : 60000; // 5 minutos para videos, 1 minuto para imágenes
        
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: timeout,
                onUploadProgress: (progressEvent) => {
                    // This could be hooked up to UI later if needed
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload progress: ${percentCompleted}%`);
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);

        let errorMessage = 'Error al subir archivo.';
        if (error.code === 'ERR_NETWORK') {
            errorMessage = 'Error de Red: El archivo es demasiado grande o la conexión es lenta. Intenta con un video más pequeño (menos de 100MB) o usa YouTube.';
        } else if (error.response?.data?.error?.message) {
            errorMessage = `Cloudinary Error: ${error.response.data.error.message}`;
        }

        throw new Error(errorMessage);
    }
};
