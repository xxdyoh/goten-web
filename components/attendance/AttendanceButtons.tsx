'use client';

import { LogIn, LogOut, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

interface AttendanceButtonsProps {
  onCheckIn: () => void;
  onCheckOut: () => void;
  onRefreshLocation: () => void;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
  isRefreshingLocation: boolean;
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  isWithinRange: boolean;
}

export default function AttendanceButtons({
  onCheckIn,
  onCheckOut,
  onRefreshLocation,
  isCheckingIn,
  isCheckingOut,
  isRefreshingLocation,
  hasCheckedIn,
  hasCheckedOut,
  isWithinRange
}: AttendanceButtonsProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Aksi Absensi</h3>
      
      <div className="space-y-3">
        <button
          onClick={onRefreshLocation}
          disabled={isRefreshingLocation}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRefreshingLocation ? (
            <LoadingSpinner size="sm" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {isRefreshingLocation ? 'Memperbarui Lokasi...' : 'Refresh Lokasi'}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCheckIn}
            disabled={isCheckingIn || hasCheckedIn || !isWithinRange}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              hasCheckedIn
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : isWithinRange
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-green-600 text-white hover:bg-green-700'
                //: 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isCheckingIn ? (
              <LoadingSpinner size="sm" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {isCheckingIn ? 'Processing...' : hasCheckedIn ? 'Done' : 'Check In'}
          </button>

          <button
            onClick={onCheckOut}
            disabled={isCheckingOut || hasCheckedOut || !isWithinRange}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              hasCheckedOut
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : isWithinRange
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-orange-600 text-white hover:bg-orange-700'
                //: 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isCheckingOut ? (
              <LoadingSpinner size="sm" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            {isCheckingOut ? 'Processing...' : hasCheckedOut ? 'Done' : 'Check Out'}
          </button>
        </div>
      </div>

      {!isWithinRange && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 text-center">
            Anda berada di luar jangkauan 500 meter dari kantor. 
            Tidak dapat melakukan absensi.
          </p>
        </div>
      )}
    </div>
  );
}