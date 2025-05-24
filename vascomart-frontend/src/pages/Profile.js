import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProfileData, saveProfileData } from '../services/userService';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: '',
    interests: [],
    nationality: ''
  });
  const [newInterest, setNewInterest] = useState('');
  const [isEditing, setIsEditing] = useState(false);


  // Handle adding new interest
  const handleAddInterest = (e) => {
    // Prevent form submission if triggered by a form
    if (e.preventDefault) e.preventDefault();
    
    // Check if we have a valid interest to add
    if (newInterest && newInterest.trim()) {
      const interest = newInterest.trim();
      
      // Ensure interests is an array and doesn't already include this interest
      const currentInterests = Array.isArray(profileData.interests) ? profileData.interests : [];
      
      if (!currentInterests.includes(interest)) {
        const updatedInterests = [...currentInterests, interest];
        
        // Update the profile data with the new interests array
        setProfileData(prev => ({
          ...prev,
          interests: updatedInterests
        }));
      }
      
      // Clear the input field
      setNewInterest('');
    }
  };

  // Handle removing interest
  const removeInterest = (interestToRemove) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interestToRemove)
    }));
  };

  // Save profile data
  const handleSave = async () => {
    if (!userData?.id) {
      setError('User not found. Please log in again.');
      return;
    }
    
    try {
      setIsSaving(true);
      setError('');
      
      // Ensure we have the latest data before saving
      const dataToSave = {
        bio: profileData.bio || '',
        nationality: profileData.nationality || '',
        interests: profileData.interests || []
      };
      
      console.log('Saving profile data:', dataToSave);
      await saveProfileData(userData.id, dataToSave);
      
      // Update the local state with the saved data
      setProfileData(dataToSave);
      setIsEditing(false);
      
      // Show success message
      setError('Profile saved successfully!');
      setTimeout(() => setError(''), 3000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !user.id) {
        navigate('/login', { state: { from: '/profile' } });
        return;
      }

      try {
        setError('');
        setIsLoading(true);
        
        // Use the user data from localStorage
        setUserData(user);
        
        // Load additional profile data from localStorage
        const additionalData = loadProfileData(user.id);
        
        console.log('Loaded profile data:', additionalData);
        
        // Always update state with loaded data or defaults
        setProfileData({
          bio: additionalData?.bio || '',
          nationality: additionalData?.nationality || '',
          interests: Array.isArray(additionalData?.interests) ? additionalData.interests : []
        });
        
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);





  if (isLoading) {
    return <div className="profile-container"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="profile-container"><p className="error">{error}</p></div>;
  }

  if (!userData) {
    return <div className="profile-container"><p>No user data found. Please log in again.</p></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Welcome back, {userData?.username || 'User'}</h2>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="edit-btn"
            >
              <i className="fas fa-edit"></i> Edit Profile
            </button>
          )}
        </div>
        
        <div className="profile-sections">
          <div className="profile-section">
            <div className="section-header">
              <i className="fas fa-user-edit"></i>
              <h3>About Me</h3>
            </div>
            {isEditing ? (
              <div className="edit-field">
                <label>Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  rows="3"
                />
              </div>
            ) : (
              <div className="view-field">
                <label>Bio</label>
                <p className={!profileData.bio ? 'placeholder' : ''}>
                  {profileData.bio || 'No bio provided'}
                </p>
              </div>
            )}
          </div>
          
          <div className="profile-section">
            <div className="section-header">
              <i className="fas fa-globe-americas"></i>
              <h3>Location</h3>
            </div>
            {isEditing ? (
              <div className="edit-field">
                <label>Nationality</label>
                <input
                  type="text"
                  value={profileData.nationality}
                  onChange={(e) => setProfileData({...profileData, nationality: e.target.value})}
                  placeholder="Your nationality"
                />
              </div>
            ) : (
              <div className="view-field">
                <label>Nationality</label>
                <p className={!profileData.nationality ? 'placeholder' : ''}>
                  {profileData.nationality || 'Not specified'}
                </p>
              </div>
            )}
          </div>
          
          <div className="profile-section">
            <div className="section-header">
              <i className="fas fa-heart"></i>
              <h3>Interests</h3>
            </div>
            {isEditing ? (
              <div className="edit-field">
                <label>Add Interests</label>
                <div className="interests-input-container">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInterest(e);
                      }
                    }}
                    placeholder="Type and press Enter to add"
                    className="interests-input"
                  />
                  <button 
                    onClick={handleAddInterest}
                    className="add-interest-btn"
                    type="button"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <div className="interests-tags">
                  {profileData.interests.map((interest, index) => (
                    <span key={index} className="tag">
                      {interest}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeInterest(interest);
                        }}
                        className="remove-tag"
                        aria-label={`Remove ${interest}`}
                        type="button"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="interests-display">
                {profileData.interests && profileData.interests.length > 0 ? (
                  <div className="interests-tags">
                    {profileData.interests.map((interest, index) => (
                      <span key={index} className="tag">
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="placeholder">No interests added yet</p>
                )}
              </div>
            )}
          </div>
          
          {isEditing && (
            <div className="form-actions">
              <button 
                onClick={() => {
                  // Reset form data
                  const savedData = loadProfileData(userData.id);
                  setProfileData({
                    bio: '',
                    interests: [],
                    nationality: '',
                    ...savedData
                  });
                  setIsEditing(false);
                }}
                className="btn btn-outline"
                type="button"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="btn btn-primary"
                disabled={isSaving}
                type="button"
              >
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
