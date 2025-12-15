import React from 'react';
import { Group } from '../types/group.types';
import { BUTTON_VARIANTS, SPACING } from '../constants/ui.constants';

interface ExpenseData {
  amount: string;
  description: string;
  category: string;
}

interface AddExpenseFormProps {
  group: Group;
  expenseData: ExpenseData;
  onExpenseDataChange: (data: ExpenseData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const EXPENSE_CATEGORIES = [
  { value: 'Food', label: '🍔 Food' },
  { value: 'Transport', label: '🚗 Transport' },
  { value: 'Entertainment', label: '🎬 Entertainment' },
  { value: 'Shopping', label: '🛍️ Shopping' },
  { value: 'Bills', label: '💡 Bills' },
  { value: 'Rent', label: '🏠 Rent' },
  { value: 'Other', label: '📱 Other' }
] as const;

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({
  group,
  expenseData,
  onExpenseDataChange,
  onSubmit,
  onCancel
}) => {
  const handleInputChange = (field: keyof ExpenseData, value: string) => {
    onExpenseDataChange({ ...expenseData, [field]: value });
  };

  const isFormValid = expenseData.amount && expenseData.description;
  const splitAmount = expenseData.amount ? parseFloat(expenseData.amount) / group.members.length : 0;

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-lg">💰</span>
        </div>
        <div>
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Add Group Expense</h3>
          <p className="text-xs sm:text-sm text-gray-600">Split equally among all members</p>
        </div>
      </div>
      
      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={expenseData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={expenseData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {EXPENSE_CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <input
          type="text"
          value={expenseData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="What's this expense for?"
        />
      </div>

      {/* Split Preview */}
      {expenseData.amount && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Split Preview:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {group.members.map((member, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm bg-white rounded-md p-2 border border-slate-200">
                <span className="text-gray-700">{member.userId.name}</span>
                <span className="font-semibold text-blue-600">
                  ${splitAmount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between font-semibold">
            <span>Total:</span>
            <span className="text-blue-600">${parseFloat(expenseData.amount).toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onSubmit}
          disabled={!isFormValid}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            isFormValid 
              ? BUTTON_VARIANTS.PRIMARY 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Add Expense
        </button>
        <button
          onClick={onCancel}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${BUTTON_VARIANTS.SECONDARY}`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;