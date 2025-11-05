'use client';

import { Clock, MapPin, CheckCircle2, XCircle } from 'lucide-react';

interface AttendanceStatusProps {
  checkInTime?: string;
  checkOutTime?: string;
  distance: number;
  isWithinRange: boolean;
}

export default function AttendanceStatus({
  checkInTime,
  checkOutTime,
  distance,
  isWithinRange
}: AttendanceStatusProps) {
  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    const time = timeString.split(' ')[1] || timeString;
    return time.substring(0, 5);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        Status Absensi Hari Ini
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border-2 ${
          checkInTime ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {checkInTime ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className={`font-medium ${checkInTime ? 'text-green-700' : 'text-gray-600'}`}>
              Check In
            </span>
          </div>
          <p className={`text-sm ${checkInTime ? 'text-green-600' : 'text-gray-500'}`}>
            {checkInTime ? formatTime(checkInTime) : 'Belum absen'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border-2 ${
          checkOutTime ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {checkOutTime ? (
              <CheckCircle2 className="w-5 h-5 text-orange-600" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className={`font-medium ${checkOutTime ? 'text-orange-700' : 'text-gray-600'}`}>
              Check Out
            </span>
          </div>
          <p className={`text-sm ${checkOutTime ? 'text-orange-600' : 'text-gray-500'}`}>
            {checkOutTime ? formatTime(checkOutTime) : 'Belum absen'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <MapPin className="w-4 h-4 text-blue-600" />
        <span className="text-sm text-blue-700">
          Jarak dari kantor: <strong>{distance.toFixed(0)} meter</strong>
          {isWithinRange ? ' ✅ Dalam jangkauan' : ' ❌ Diluar jangkauan'}
        </span>
      </div>
    </div>
  );
}