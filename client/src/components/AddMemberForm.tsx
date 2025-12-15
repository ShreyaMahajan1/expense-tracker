import React from 'react';
import { BUTTON_VARIANTS } from '../constants/ui.constants';

interface AddMemberFormProps {
  memberEmail: string;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({
  memberEmail,
  onEmailChange,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const isFormValid = memberEmail.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && !isLoading) {
      onSubmit();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-lg">👥</span>
        </div>
        <div>
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Add Group Member</h3>
          <p className="text-xs sm:text-sm text-gray-600">Invite someone to join this group</p>
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={memberEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter their email address"
            disabled={isLoading}
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              isFormValid && !isLoading
                ? BUTTON_VARIANTS.PRIMARY
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Adding...' : 'Add Member'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${BUTTON_VARIANTS.SECONDARY}`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMemberForm;