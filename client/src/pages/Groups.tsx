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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Groups</h1>
            <p className="text-gray-600 text-sm md:text-base mt-1">Split expenses with friends and family</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full md:w-auto"
          >
            {showForm ? 'Cancel' : '+ Create Group'}
          </button>
        </div>

        {/* Create Group Form */}
        {showForm && (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm md:text-base">Group Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Roommates, Trip to Goa"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2 text-sm md:text-base">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="What's this group for?"
                />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition w-full md:w-auto">
                Create Group
              </button>
            </form>
          </div>
        )}

        {/* Groups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Groups List */}
          <div className="lg:col-span-1 space-y-4">
            {groups.map((group) => (
              <div
                key={group._id}
                onClick={() => setSelectedGroup(group._id)}
                className={`bg-white p-4 rounded-lg shadow-md cursor-pointer transition hover:shadow-lg ${
                  selectedGroup === group._id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <h3 className="font-bold text-lg mb-1">{group.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{group.description}</p>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    👥 {group.members.length} members
                  </div>
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
                    💰 ${calculateGroupTotal(group.expenses).toFixed(2)}
                  </div>
                  <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                    📝 {group.expenses.length} expenses
                  </div>
                </div>

                {group.members.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">Per person share:</p>
                    <p className="text-lg font-bold text-blue-600">
                      ${calculatePerPersonShare(group).toFixed(2)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/groups/${group._id}`);
                      }}
                      className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                    >
                      💳 View Details & Pay
                    </button>
                  </div>
                )}
              </div>
            ))}

            {groups.length === 0 && (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="text-5xl mb-3">👥</div>
                <h3 className="font-bold mb-2">No groups yet</h3>
                <p className="text-gray-500 text-sm mb-4">Create your first group to start splitting expenses</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Create Group
                </button>
              </div>
            )}
          </div>

          {/* Group Details */}
          <div className="lg:col-span-2">
            {selectedGroup && getSelectedGroup() ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Group Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-2">{getSelectedGroup()!.name}</h2>
                  <p className="text-blue-100 text-sm md:text-base">{getSelectedGroup()!.description}</p>
                  
                  <div className="mt-4 grid grid-cols-3 gap-2 md:gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                      <p className="text-xs md:text-sm text-blue-100">Total Spent</p>
                      <p className="text-lg md:text-2xl font-bold">${calculateGroupTotal(getSelectedGroup()!.expenses).toFixed(2)}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                      <p className="text-xs md:text-sm text-blue-100">Per Person</p>
                      <p className="text-lg md:text-2xl font-bold">${calculatePerPersonShare(getSelectedGroup()!).toFixed(2)}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                      <p className="text-xs md:text-sm text-blue-100">Expenses</p>
                      <p className="text-lg md:text-2xl font-bold">{getSelectedGroup()!.expenses.length}</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b">
                  <div className="flex overflow-x-auto">
                    <button className="px-4 md:px-6 py-3 border-b-2 border-blue-600 text-blue-600 font-semibold text-sm md:text-base whitespace-nowrap">
                      Expenses
                    </button>
                    <button className="px-4 md:px-6 py-3 text-gray-600 hover:text-gray-800 text-sm md:text-base whitespace-nowrap">
                      Members
                    </button>
                    <button className="px-4 md:px-6 py-3 text-gray-600 hover:text-gray-800 text-sm md:text-base whitespace-nowrap">
                      Balances
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6">
                  {/* Add Expense Button */}
                  <button
                    onClick={() => setShowExpenseForm(showExpenseForm === selectedGroup ? null : selectedGroup)}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition mb-4 font-semibold"
                  >
                    + Add Group Expense
                  </button>

                  {/* Add Expense Form */}
                  {showExpenseForm === selectedGroup && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-green-200">
                      <h5 className="font-semibold mb-4 text-lg">New Group Expense</h5>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={expenseData.amount}
                            onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={expenseData.description}
                            onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="What's this for?"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            value={expenseData.category}
                            onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option>🍔 Food</option>
                            <option>🚗 Transport</option>
                            <option>🎬 Entertainment</option>
                            <option>🛍️ Shopping</option>
                            <option>💡 Bills</option>
                            <option>🏠 Rent</option>
                            <option>📱 Other</option>
                          </select>
                        </div>
                        
                        {/* Split Preview */}
                        {expenseData.amount && (
                          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Split Preview:</p>
                            <div className="space-y-2">
                              {getSelectedGroup()!.members.map((member, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-700">{member.userId.name}</span>
                                  <span className="font-bold text-blue-600">
                                    ${(parseFloat(expenseData.amount) / getSelectedGroup()!.members.length).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-blue-200 flex justify-between font-bold">
                              <span>Total:</span>
                              <span className="text-blue-600">${parseFloat(expenseData.amount).toFixed(2)}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddGroupExpense(selectedGroup)}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                          >
                            Add Expense
                          </button>
                          <button
                            onClick={() => setShowExpenseForm(null)}
                            className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Members Section */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-700">Members ({getSelectedGroup()!.members.length})</h4>
                      <button
                        onClick={() => setShowMemberForm(showMemberForm === selectedGroup ? null : selectedGroup)}
                        className="text-blue-600 text-sm hover:underline font-medium"
                      >
                        + Add Member
                      </button>
                    </div>

                    {showMemberForm === selectedGroup && (
                      <div className="mb-3 flex gap-2">
                        <input
                          type="email"
                          value={memberEmail}
                          onChange={(e) => setMemberEmail(e.target.value)}
                          placeholder="Enter email address"
                          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleAddMember(selectedGroup)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getSelectedGroup()!.members.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                              {member.userId.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{member.userId.name}</p>
                              <p className="text-xs text-gray-500">{member.userId.email}</p>
                            </div>
                          </div>
                          {member.role === 'admin' && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Admin</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expenses List */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Recent Expenses</h4>
                    {getSelectedGroup()!.expenses.length > 0 ? (
                      <div className="space-y-2">
                        {getSelectedGroup()!.expenses.slice().reverse().map((expense) => (
                          <div key={expense._id} className="bg-gray-50 p-4 rounded-lg border hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">{expense.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Paid by {expense.userId?.name || 'Unknown'} • {format(new Date(expense.date), 'MMM dd, yyyy')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-800">${expense.amount.toFixed(2)}</p>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{expense.category}</span>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-2">Split among {getSelectedGroup()!.members.length} members:</p>
                              <div className="flex flex-wrap gap-2">
                                {getSelectedGroup()!.members.map((member, idx) => (
                                  <div key={idx} className="text-xs bg-white px-3 py-1 rounded-full border">
                                    {member.userId.name}: <span className="font-semibold text-blue-600">
                                      ${(expense.amount / getSelectedGroup()!.members.length).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-4xl mb-2">📝</p>
                        <p>No expenses yet. Add your first expense!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">👈</div>
                <h3 className="text-xl font-bold mb-2">Select a group</h3>
                <p className="text-gray-500">Choose a group from the list to view details and manage expenses</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Groups;
