// UI Constants for consistent styling and behavior

export const MODAL_CLASSES = {
  OVERLAY: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-8 z-50',
  CONTAINER: 'bg-white rounded-2xl shadow-lg w-full max-w-sm sm:max-w-sm lg:max-w-md h-auto max-h-[90vh] sm:max-h-[70vh] flex flex-col',
  HEADER: 'bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-4 sm:p-4 flex-shrink-0',
  CONTENT: 'p-4 sm:p-4 overflow-y-auto flex-1 min-h-0 space-y-4 sm:space-y-3 scrollbar-hide'
} as const;

export const BUTTON_VARIANTS = {
  PRIMARY: 'bg-blue-600 hover:bg-blue-700 text-white',
  SECONDARY: 'bg-gray-200 hover:bg-gray-300 text-gray-700',
  SUCCESS: 'bg-green-600 hover:bg-green-700 text-white',
  DANGER: 'bg-red-600 hover:bg-red-700 text-white',
  WARNING: 'bg-orange-600 hover:bg-orange-700 text-white'
} as const;

export const TEXT_SIZES = {
  MOBILE_HEADER: 'text-sm sm:text-xl',
  MOBILE_SUBHEADER: 'text-lg sm:text-xl',
  MOBILE_BODY: 'text-sm sm:text-base',
  MOBILE_CAPTION: 'text-xs sm:text-sm'
} as const;

export const SPACING = {
  MOBILE_PADDING: 'p-3 sm:p-4',
  MOBILE_MARGIN: 'm-3 sm:m-4',
  MOBILE_GAP: 'gap-2 sm:gap-4'
} as const;