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
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
      {/* Group Title - Mobile Optimized */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-lg sm:text-xl">👥</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{group.name}</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {group.members.length} member{group.members.length !== 1 ? 's' : ''} • {group.expenses.length} expense{group.expenses.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      {/* Stats - Mobile First Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm sm:text-base">💰</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">Total Spent</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">${totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm sm:text-base">👤</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">Per Person</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">${perPersonShare.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm sm:text-base">📊</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">Average</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">${averagePerExpense.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;