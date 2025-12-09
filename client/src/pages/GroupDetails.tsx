import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

interface Balance {
  userId: string;
  userName: string;
  userEmail: string;
  balance: number;
  status: 'owed' | 'owes' | 'settled';
}

interface Settlement {
  _id: string;
  fromUserId: { _id: string; name: string; email: string };
  toUserId: { _id: string; name: string; email: string };
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: Date;
  createdAt: string;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: Array<{
    userId: { _id: string; name: string; email: string; upiId?: string; phoneNumber?: string };
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

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'settlements'>('expenses');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionId, setTransactionId] = useState('');
  const [upiLink, setUpiLink] = useState('');
  const [payeeUpiId, setPayeeUpiId] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, balancesRes, settlementsRes] = await Promise.all([
        axios.get(`/api/groups`),
        axios.get(`/api/settlements/group/${groupId}/balances`),
        axios.get(`/api/settlements/group/${groupId}`)
      ]);

      const currentGroup = groupRes.data.find((g: Group) => g._id === groupId);
      setGroup(currentGroup);
      setBalances(balancesRes.data);
      setSettlements(settlementsRes.data);
    } catch (error) {
      console.error('Failed to fetch group data:', error);
    }
  };

  const handlePayNow = async (balance: Balance) => {
    setSelectedBalance(balance);
    
    // Find who to pay (person with positive balance)
    const payee = balances.find(b => b.balance > 0 && b.userId !== balance.userId);
    if (!payee) {
      alert('No one to pay in this group');
      return;
    }

    try {
      // Create settlement request
      const settlementRes = await axios.post('/api/settlements/request', {
        groupId,
        toUserId: payee.userId,
        amount: Math.abs(balance.balance)
      });

      setPayeeName(payee.userName);
      setPaymentAmount(Math.abs(balance.balance));
      
      // Generate UPI link for direct payment
      const upiRes = await axios.post(`/api/settlements/${settlementRes.data._id}/upi-link`);
      setUpiLink(upiRes.data.upiLink);
      setPayeeUpiId(upiRes.data.payeeUpiId);
      
      // Show payment modal
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error('Failed to create payment:', error);
      const errorMsg = error.response?.data?.error || 'Failed to create payment request';
      alert(errorMsg);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedBalance) return;

    if (!transactionId.trim()) {
      alert('Please enter the transaction ID from your UPI app');
      return;
    }

    try {
      const pendingSettlement = settlements.find(
        s => s.fromUserId._id === selectedBalance.userId && s.status === 'pending'
      );

      if (pendingSettlement) {
        await axios.post(`/api/settlements/${pendingSettlement._id}/pay`, {
          paymentMethod,
          transactionId
        });

        setShowPaymentModal(false);
        setTransactionId('');
        setPaymentProof(null);
        fetchGroupData();
        alert('✅ Payment recorded successfully! The payee can verify the transaction ID.');
      }
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      alert('Failed to mark payment as paid');
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading group...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalSpent = group.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const perPersonShare = group.members.length > 0 ? totalSpent / group.members.length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <button
          onClick={() => navigate('/groups')}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Groups
        </button>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{group.name}</h1>
          <p className="text-blue-100 mb-4">{group.description}</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-sm text-blue-100">Total Spent</p>
              <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-sm text-blue-100">Per Person</p>
              <p className="text-2xl font-bold">${perPersonShare.toFixed(2)}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-sm text-blue-100">Members</p>
              <p className="text-2xl font-bold">{group.members.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'expenses'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📝 Expenses
            </button>
            <button
              onClick={() => setActiveTab('balances')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'balances'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              💰 Balances
            </button>
            <button
              onClick={() => setActiveTab('settlements')}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === 'settlements'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              💳 Payments
            </button>
          </div>

          <div className="p-6">
            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
              <div className="space-y-3">
                {group.expenses.length > 0 ? (
                  group.expenses.slice().reverse().map((expense) => (
                    <div key={expense._id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{expense.description}</h3>
                          <p className="text-sm text-gray-600">
                            Paid by {expense.userId?.name} • {format(new Date(expense.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">${expense.amount.toFixed(2)}</p>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {expense.category}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-600 mb-2">Split: ${(expense.amount / group.members.length).toFixed(2)} per person</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No expenses yet</p>
                )}
              </div>
            )}

            {/* Balances Tab */}
            {activeTab === 'balances' && (
              <div className="space-y-4">
                {balances.map((balance) => (
                  <div
                    key={balance.userId}
                    className={`p-4 rounded-lg border-2 ${
                      balance.status === 'owed'
                        ? 'bg-green-50 border-green-200'
                        : balance.status === 'owes'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{balance.userName}</h3>
                        <p className="text-sm text-gray-600">{balance.userEmail}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-2xl font-bold ${
                            balance.status === 'owed'
                              ? 'text-green-600'
                              : balance.status === 'owes'
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {balance.status === 'owed' && '+'}
                          ${Math.abs(balance.balance).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {balance.status === 'owed' && 'is owed'}
                          {balance.status === 'owes' && 'owes'}
                          {balance.status === 'settled' && 'settled up'}
                        </p>
                      </div>
                    </div>
                    {balance.status === 'owes' && (
                      <button
                        onClick={() => handlePayNow(balance)}
                        className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
                      >
                        💳 Pay Now via UPI
                      </button>
                    )}
                  </div>
                ))}
                {balances.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No balances to show</p>
                )}
              </div>
            )}

            {/* Settlements Tab */}
            {activeTab === 'settlements' && (
              <div className="space-y-3">
                {settlements.map((settlement) => (
                  <div
                    key={settlement._id}
                    className={`p-4 rounded-lg border ${
                      settlement.status === 'paid'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">
                          {settlement.fromUserId.name} → {settlement.toUserId.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(settlement.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">${settlement.amount.toFixed(2)}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            settlement.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {settlement.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                    {settlement.status === 'paid' && settlement.paymentMethod && (
                      <div className="mt-2 pt-2 border-t text-sm text-gray-600">
                        <p>Payment: {settlement.paymentMethod}</p>
                        {settlement.transactionId && <p>ID: {settlement.transactionId}</p>}
                        {settlement.paidAt && (
                          <p>Paid: {format(new Date(settlement.paidAt), 'MMM dd, yyyy HH:mm')}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {settlements.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No payment history</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBalance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 my-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Pay ₹{paymentAmount.toFixed(2)}</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setTransactionId('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              To: <span className="font-semibold">{payeeName}</span>
            </p>

            {/* UPI Payment Section */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-3 text-center">📱 Pay via UPI</h3>
              {upiLink && payeeUpiId ? (
                <>
                  <div className="flex justify-center mb-3">
                    <div className="bg-white p-3 rounded-lg shadow">
                      <QRCodeSVG value={upiLink} size={150} />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600 mb-1">UPI ID:</p>
                    <p className="font-mono text-sm text-blue-700 font-bold break-all">{payeeUpiId}</p>
                  </div>
                  <p className="text-xs text-center text-gray-700 mb-2">
                    Scan QR code with any UPI app or pay to the UPI ID above
                  </p>
                  <div className="bg-blue-100 rounded p-2">
                    <p className="text-xs text-blue-800 text-center">
                      💡 Works with GPay, PhonePe, Paytm, BHIM, etc.
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-800 text-center">
                    ⚠️ Payee hasn't set up their UPI ID yet.
                    <br />
                    Please ask them to add it in Profile settings.
                  </p>
                </div>
              )}
            </div>

            {/* Payment Verification Form */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-800 mb-3 text-center">
                After payment, verify here:
              </p>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g., 123456789012"
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleMarkAsPaid}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                >
                  ✅ Verify Manual Payment
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setShowPaymentModal(false);
                setTransactionId('');
              }}
              className="w-full mt-3 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
