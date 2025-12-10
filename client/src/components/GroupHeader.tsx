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
    <div className="glass p-4 sm:p-5 rounded-3xl shadow-lg mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full -mr-12 -mt-12"></div>
      
      <div className="relative z-10">
        {/* Mobile Layout (Stacked) */}
        <div className="block sm:hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg">
              👥
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-800 truncate">{group.name}</h1>
              <p className="text-xs text-gray-600">{group.members.length} members</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-3 text-center">
              <p className="text-base font-bold text-gray-800">${totalSpent.toFixed(2)}</p>
              <p className="text-xs text-gray-600">Total Spent</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-3 text-center">
              <p className="text-base font-bold text-purple-600">${perPersonShare.toFixed(2)}</p>
              <p className="text-xs text-gray-600">Per Person</p>
            </div>
          </div>
        </div>

        {/* Desktop Layout (Enhanced) */}
        <div className="hidden sm:block">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">
              👥
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{group.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{group.members.length} members</span>
                <span>{group.expenses.length} expenses</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/70 transition-all duration-300">
              <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xl shadow-lg">
                💰
              </div>
              <p className="text-xs text-gray-600 mb-1 font-medium">Total Spent</p>
              <p className="text-xl font-bold text-gray-800">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/70 transition-all duration-300">
              <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl shadow-lg">
                👤
              </div>
              <p className="text-xs text-gray-600 mb-1 font-medium">Per Person</p>
              <p className="text-xl font-bold text-purple-600">${perPersonShare.toFixed(2)}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white/70 transition-all duration-300">
              <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xl shadow-lg">
                📊
              </div>
              <p className="text-xs text-gray-600 mb-1 font-medium">Average per Expense</p>
              <p className="text-xl font-bold text-gray-800">${averagePerExpense.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;