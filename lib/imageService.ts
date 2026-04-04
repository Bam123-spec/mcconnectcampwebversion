import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

export const pickImage = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true, // We need base64 for Supabase upload
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].base64 || null; // Return base64 string
    }

    return null;
};

export const uploadAvatar = async (base64Image: string, userId: string): Promise<string | null> => {
    try {
        const fileName = `${userId}/${Date.now()}.png`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(filePath, decode(base64Image), {
                contentType: 'image/png',
                upsert: true,
            });

        if (error) {
            console.error('Error uploading avatar:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error in uploadAvatar:', error);
        return null;
    }
};
