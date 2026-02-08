import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const COMPRESSION_QUALITY = 0.8;

export const compressImage = async (uri) => {
    try {
        const compressed = await manipulateAsync(
            uri,
            [{ resize: { width: MAX_WIDTH, height: MAX_HEIGHT } }],
            { compress: COMPRESSION_QUALITY, format: SaveFormat.JPEG }
        );
        return compressed.uri;
    } catch (error) {
        console.error('Image compression error:', error);
        throw error;
    }
};

export const convertToBase64 = async (uri) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Base64 conversion error:', error);
        throw error;
    }
};
