import React from 'react';
import { Group } from '../types/group.types';

interface GroupHeaderProps {
  group: Group;
  totalSpent: number;
  perPersonShare: number;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ 
  group, 
  totalSpent, 
  perPersonShare 
}) => {
  const averagePerExpense = group.expenses.length > 0 
    ? totalSpent / group.expenses.length 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {/* Group Title */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-xl">👥</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-gray-600">{group.members.length} members • {group.expenses.length} expenses</p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Per Person</p>
              <p className="text-xl font-bold text-gray-900">${perPersonShare.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average</p>
              <p className="text-xl font-bold text-gray-900">${averagePerExpense.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;