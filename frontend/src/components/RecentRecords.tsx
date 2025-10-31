<<<<<<< HEAD
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { ECGRecord, formatDate, formatFileSize } from '../services/api';

interface RecentRecordsProps {
  records: ECGRecord[];
}

const RecentRecords: React.FC<RecentRecordsProps> = ({ records }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Activity className="w-4 h-4 text-yellow-600 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No ECG records found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Upload your first ECG to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <Link
          key={record.id}
          to={`/results/${record.id}`}
          className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                {getStatusIcon(record.status)}
                <p className="text-sm font-medium text-foreground truncate">
                  {record.original_filename}
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(record.file_size)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(record.created_at)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  record.status
                )}`}
              >
                {record.status}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RecentRecords;


=======
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { ECGRecord, formatDate, formatFileSize } from '../services/api';

interface RecentRecordsProps {
  records: ECGRecord[];
}

const RecentRecords: React.FC<RecentRecordsProps> = ({ records }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Activity className="w-4 h-4 text-yellow-600 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No ECG records found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Upload your first ECG to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <Link
          key={record.id}
          to={`/results/${record.id}`}
          className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                {getStatusIcon(record.status)}
                <p className="text-sm font-medium text-foreground truncate">
                  {record.original_filename}
                </p>
              </div>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(record.file_size)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(record.created_at)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  record.status
                )}`}
              >
                {record.status}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RecentRecords;


>>>>>>> 9163bc16ccf897faeceb43da7f02dfc306ca84a6
