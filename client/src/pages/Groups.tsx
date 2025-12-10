import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { format } from 'date-fns';

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
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState<string | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [expenseData, setExpenseData] = useState({
    amount: '',
    description: '',
    category: 'Food'
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const response = await axios.get('/api/groups');
    setGroups(response.data);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/groups', formData);
    setShowForm(false);
    setFormData({ name: '', description: '' });
    fetchGroups();
  };

  const handleAddMember = async (groupId: string) => {
    try {
      await axios.post(`/api/groups/${groupId}/members`, { email: memberEmail });
      setShowMemberForm(null);
      setMemberEmail('');
      fetchGroups();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleAddGroupExpense = async (groupId: string) => {
    try {
      const group = groups.find(g => g._id === groupId);
      if (!group) return;

      const amount = parseFloat(expenseData.amount);
      const splitAmount = amount / group.members.length;

      const splits = group.members.map(member => ({
        userId: member.userId._id,
        amount: splitAmount
      }));

      await axios.post(`/api/groups/${groupId}/expenses`, {
        amount: expenseData.amount,
        description: expenseData.description,
        category: expenseData.category,
        splits
      });

      setShowExpenseForm(null);
      setExpenseData({ amount: '', description: '', category: 'Food' });
      fetchGroups();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add expense');
    }
  };

  const calculateGroupTotal = (expenses: any[]) => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const calculatePerPersonShare = (group: Group) => {
    const total = calculateGroupTotal(group.expenses);
    return group.members.length > 0 ? total / group.members.length : 0;
  };

  const getSelectedGroup = () => groups.find(g => g._id === selectedGroup);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient mb-4">
            Your Groups
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-6">
            Split expenses effortlessly with friends, family, and roommates ✨
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`btn-gradient text-white px-6 sm:px-8 py-3 sm:py-4 rounded-3xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 ${
              showForm ? 'bg-gradient-to-r from-red-400 to-pink-500' : ''
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{showForm ? '✕' : '+'}</span>
              <span>{showForm ? 'Cancel' : 'Create New Group'}</span>
            </span>
          </button>
        </div>

        {/* Create Group Form */}
        {showForm && (
          <div className="card-hover glass p-6 sm:p-8 rounded-3xl shadow-2xl mb-8 sm:mb-12 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full -mr-16 -mt-16"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
                  ✨
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Create New Group</h2>
                  <p className="text-gray-600 text-sm">Start splitting expenses together</p>
                </div>
              </div>
              
              <form onSubmit={handleCreateGroup} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-3">Group Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-organic w-full px-6 py-4 text-gray-800 placeholder-gray-500"
                    placeholder="e.g., Roommates, Trip to Goa, Office Lunch"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-3">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-organic w-full px-6 py-4 text-gray-800 placeholder-gray-500 resize-none"
                    rows={3}
                    placeholder="What's this group for? Add some context..."
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-gradient w-full py-4 text-white font-semibold rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-lg">🎉</span>
                    <span>Create Group</span>
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {groups.map((group) => (
            <div
              key={group._id}
              className="card-hover glass p-4 sm:p-6 rounded-3xl shadow-2xl relative overflow-hidden group cursor-pointer"
              onClick={() => navigate(`/groups/${group._id}`)}
            >
              {/* Decorative gradient blob */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                {/* Group Icon & Name */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                      👥
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-gray-800 mb-2 truncate group-hover:text-purple-600 transition-colors">
                      {group.name}
                    </h3>
                    {group.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">Total Spent</span>
                    <span className="text-lg font-bold text-gray-800">
                      ${calculateGroupTotal(group.expenses).toFixed(2)}
                    </span>
                  </div>
                  
                  {group.members.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 font-medium">Per Person</span>
                      <span className="text-base font-bold text-purple-600">
                        ${calculatePerPersonShare(group).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="bg-blue-100/80 text-blue-700 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    👥 {group.members.length}
                  </div>
                  <div className="bg-green-100/80 text-green-700 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    📝 {group.expenses.length}
                  </div>
                </div>

                {/* Members Preview */}
                {group.members.length > 0 && (
                  <div className="mb-4">
                    <div className="flex -space-x-2 mb-2">
                      {group.members.slice(0, 4).map((member, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md"
                          title={member.userId.name}
                        >
                          {member.userId.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {group.members.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md">
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
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
                  className="w-full btn-gradient text-white py-3 rounded-2xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-base">💳</span>
                    <span>View & Manage</span>
                  </span>
                </button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {groups.length === 0 && (
            <div className="col-span-full">
              <div className="card-hover glass p-8 sm:p-12 rounded-3xl shadow-2xl text-center max-w-md mx-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full -mr-16 -mt-16"></div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl shadow-lg float-animation">
                    👥
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800">No groups yet</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-6">
                    Create your first group to start splitting expenses with friends and family
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn-gradient text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">✨</span>
                      <span>Create First Group</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add New Group Card */}
          {groups.length > 0 && (
            <div
              onClick={() => setShowForm(true)}
              className="card-hover glass p-6 rounded-3xl shadow-2xl relative overflow-hidden group cursor-pointer border-2 border-dashed border-purple-300/50 hover:border-purple-400/70 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="relative z-10 text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  ➕
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                  Create New Group
                </h3>
                <p className="text-gray-600 text-sm">
                  Start splitting expenses with a new group
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;
