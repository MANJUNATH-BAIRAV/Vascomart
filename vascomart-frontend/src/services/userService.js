const API_BASE_URL = 'http://localhost:8081/api/v1/users';

export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Local storage helpers for additional profile data
export const loadProfileData = (userId) => {
  try {
    const data = localStorage.getItem(`user_profile_${userId}`);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    // Ensure we always return an object with all required fields
    return {
      bio: parsed.bio || '',
      nationality: parsed.nationality || '',
      interests: Array.isArray(parsed.interests) ? parsed.interests : []
    };
  } catch (error) {
    console.error('Error loading profile data:', error);
    return {
      bio: '',
      interests: [],
      nationality: ''
    };
  }
};

export const saveProfileData = (userId, data) => {
  try {
    if (!userId) {
      throw new Error('User ID is required to save profile data');
    }
    
    const profileData = {
      bio: data.bio || '',
      nationality: data.nationality || '',
      interests: Array.isArray(data.interests) ? data.interests : []
    };
    
    localStorage.setItem(`user_profile_${userId}`, JSON.stringify(profileData));
    return profileData;
  } catch (error) {
    console.error('Error saving profile data:', error);
    throw error;
  }
};
