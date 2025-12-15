import { useEffect, useState } from 'react';
import axios from '../config/axios';
import Navbar from '../components/Navbar';
import NotificationSettings from '../components/NotificationSettings';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../utils/toast';
import { maskUpiId, validateUpiId, formatUpiId } from '../utils/upiUtils';

interface Profile {
  _id: string;
  name: string;
  email: string;
  upiId?: string;
  phoneNumber?: string;
}

const Profile = () => {
  const { updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    upiId: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile');
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        upiId: response.data.upiId || '',
        phoneNumber: response.data.phoneNumber || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      showError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate UPI ID if provided
    if (formData.upiId) {
      const validation = validateUpiId(formData.upiId);
      if (!validation.isValid) {
        showError(validation.error || 'Please enter a valid UPI ID');
        return;
      }
    }

    setSaving(true);
    try {
      const dataToSubmit = {
        ...formData,
        upiId: formData.upiId ? formatUpiId(formData.upiId) : ''
      };
      
      const response = await axios.put('/api/profile', dataToSubmit);
      setProfile(response.data);
      setIsEditing(false);
      
      // Update the user in AuthContext so navbar reflects the changes
      updateUser({
        name: response.data.name,
        email: response.data.email
      });
      
      if (formData.upiId && !profile?.upiId) {
        showSuccess('🎉 Great! Your UPI ID has been set up. You can now receive payments from group members!');
      } else {
        showSuccess('Profile updated successfully!');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-2xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Profile Settings</h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-lg sm:text-xl md:text-3xl font-bold">
                {profile?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base sm:text-lg md:text-2xl font-bold">{profile?.name}</h2>
                <p className="text-blue-100 text-sm sm:text-base">{profile?.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-4 sm:p-6">
            {!isEditing ? (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Name</label>
                  <p className="text-base sm:text-lg font-semibold">{profile?.name}</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Email</label>
                  <p className="text-sm sm:text-base">{profile?.email}</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">UPI ID</label>
                  {profile?.upiId ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm sm:text-base font-mono bg-green-50 text-green-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                        {maskUpiId(profile.upiId)}
                      </p>
                      <span className="text-green-600">✅</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(profile.upiId!);
                          showSuccess('UPI ID copied to clipboard!');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm underline"
                      >
                        Copy Full ID
                      </button>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                      <p className="text-yellow-800 text-xs sm:text-sm">
                        ⚠️ No UPI ID set. Add your UPI ID to receive payments from group members.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                  <p className="text-sm sm:text-base">{profile?.phoneNumber || 'Not set'}</p>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition font-semibold text-sm sm:text-base mt-4 sm:mt-6"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email</label>
                  <input
                    type="email"
                    value={profile?.email}
                    disabled
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    UPI ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm sm:text-base"
                    placeholder="yourname@paytm / yourname@ybl"
                  />
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-blue-800 font-medium mb-1 sm:mb-2">💡 How to find your UPI ID:</p>
                    <ul className="text-xs text-blue-700 space-y-0.5 sm:space-y-1">
                      <li>• <strong>PhonePe:</strong> Profile → Your UPI ID (@ybl)</li>
                      <li>• <strong>Google Pay:</strong> Profile → Payment methods (@okaxis)</li>
                      <li>• <strong>Paytm:</strong> Profile → Payment Settings (@paytm)</li>
                      <li>• <strong>SBI:</strong> YONO SBI → UPI → Manage UPI ID (@sbi)</li>
                    </ul>
                  </div>
                  
                  <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-yellow-800 font-medium mb-1">⚠️ UPI ID Issues?</p>
                    <p className="text-xs text-yellow-700">
                      Try common domains like @paytm, @ybl, or @sbi instead of @oksbi
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* Notification Settings */}
                <NotificationSettings />

                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-green-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400 text-sm sm:text-base"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: profile?.name || '',
                        upiId: profile?.upiId || '',
                        phoneNumber: profile?.phoneNumber || ''
                      });
                    }}
                    className="px-4 sm:px-6 bg-gray-200 text-gray-700 py-2.5 sm:py-3 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-green-900 mb-1 sm:mb-2 text-sm sm:text-base">✅ Why add UPI ID?</h3>
            <p className="text-xs sm:text-sm text-green-800">
              When you're part of a group and someone owes you money, they can pay you directly via UPI. 
              Your UPI ID is used to generate payment links that open in their UPI apps.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">🔒 Privacy & Security</h3>
            <p className="text-xs sm:text-sm text-blue-800">
              Your UPI ID is only visible to members of groups you're part of. We never store your UPI PIN or 
              any sensitive payment information. All payments happen through your UPI app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
