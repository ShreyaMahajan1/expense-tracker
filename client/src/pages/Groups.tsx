import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useToast } from '../utils/toast';

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: Array<{
    userId: { _id: string; name: string; email: string };
    role: string;
  }>;
  expenses: Array<{
    _id: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    userId: { _id: string; name: string };
  }>;
}

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      showError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/groups', formData);
      setShowForm(false);
      setFormData({ name: '', description: '' });
      showSuccess('Group created successfully!');
      fetchGroups();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Failed to create group');
    }
  };

  const calculateGroupTotal = (expenses: any[]) => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const calculatePerPersonShare = (group: Group) => {
    const total = calculateGroupTotal(group.expenses);
    return group.members.length > 0 ? total / group.members.length : 0;
  };

  // Calculate total across all groups
  const totalAcrossGroups = groups.reduce((sum, group) => sum + calculateGroupTotal(group.expenses), 0);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
            <span className="text-2xl">👥</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-blue-500 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading your groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-2xl text-white">👥</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Groups
              </h1>
              <p className="text-slate-600 mt-1">
                Split expenses with friends, family, and roommates
              </p>
            </div>
          </div>
          
          {/* Total Groups Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Group Expenses</p>
                <p className="text-3xl font-bold text-slate-900">${totalAcrossGroups.toFixed(2)}</p>
                <p className="text-sm text-slate-500 mt-1">{groups.length} active groups</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                {showForm ? '✕ Cancel' : '+ Create Group'}
              </button>
            </div>
          </div>
        </div>

        {/* Create Group Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create New Group</h2>
                <p className="text-slate-600 text-sm">Start splitting expenses with others</p>
              </div>
            </div>
            
            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div>
                <label className="block text-slate-700 font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Roommates, Trip to Goa, Office Lunch"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  rows={3}
                  placeholder="What's this group for? Add some context..."
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Create Group
              </button>
            </form>
          </div>
        )}

        {/* Groups Grid */}
        <div className={`grid gap-6 ${
          groups.length === 0 ? 'grid-cols-1' :
          groups.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
          groups.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {groups.map((group) => (
            <div
              key={group._id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => navigate(`/groups/${group._id}`)}
            >
              <div className="p-6">
                {/* Group Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-slate-900 truncate">
                      {group.name}
                    </h3>
                    {group.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total Spent</span>
                    <span className="text-lg font-bold text-slate-900">
                      ${calculateGroupTotal(group.expenses).toFixed(2)}
                    </span>
                  </div>
                  
                  {group.members.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Per Person</span>
                      <span className="text-base font-semibold text-blue-600">
                        ${calculatePerPersonShare(group).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                    👥 {group.members.length} members
                  </div>
                  <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                    📝 {group.expenses.length} expenses
                  </div>
                </div>

                {/* Members Preview */}
                {group.members.length > 0 && (
                  <div className="mb-4">
                    <div className="flex -space-x-2 mb-2">
                      {group.members.slice(0, 4).map((member, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm"
                          title={member.userId.name}
                        >
                          {member.userId.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {group.members.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {group.members.slice(0, 2).map(m => m.userId.name).join(', ')}
                      {group.members.length > 2 && ` +${group.members.length - 2} more`}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/groups/${group._id}`);
                  }}
                  className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                >
                  View & Manage
                </button>
              </div>
            </div>
          ))}

          {/* Add New Group Card - Only show if there are existing groups */}
          {groups.length > 0 && (
            <div
              onClick={() => setShowForm(true)}
              className="bg-white rounded-xl shadow-sm border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors cursor-pointer"
            >
              <div className="p-6 text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">➕</span>
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">
                  Create New Group
                </h3>
                <p className="text-slate-600 text-sm">
                  Start splitting expenses with a new group
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {groups.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No groups yet</h3>
            <p className="text-slate-600 mb-6">
              Create your first group to start splitting expenses with friends and family
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Create First Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;