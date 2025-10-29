import React from 'react';
import { useQuery } from 'react-query';
import { Activity, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { ecgService, processingService } from '../services/api';
import { formatDate } from '../services/api';

const ProcessingPage: React.FC = () => {
  const { data: records, isLoading } = useQuery('ecg-records', ecgService.getRecords);

  const processingRecords = records?.filter(record => 
    record.status === 'processing' || record.status === 'uploaded'
  ) || [];

  const completedRecords = records?.filter(record => 
    record.status === 'completed'
  ) || [];

  const failedRecords = records?.filter(record => 
    record.status === 'failed'
  ) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Activity className="w-5 h-5 text-yellow-600 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Processing Status</h1>
        <p className="text-muted-foreground mt-2">
          Monitor the status of your ECG processing jobs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-medical">
          <div className="card-medical-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-foreground">{processingRecords.length}</p>
              </div>
              <Activity className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card-medical">
          <div className="card-medical-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{completedRecords.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card-medical">
          <div className="card-medical-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-foreground">{failedRecords.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Processing Records */}
      {processingRecords.length > 0 && (
        <div className="card-medical">
          <div className="card-medical-header">
            <h3 className="text-lg font-semibold">Currently Processing</h3>
            <p className="text-sm text-muted-foreground">
              {processingRecords.length} record(s) being processed
            </p>
          </div>
          <div className="card-medical-content">
            <div className="space-y-4">
              {processingRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {record.original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Started: {formatDate(record.processing_started_at || record.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                    {record.status === 'processing' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Completed Records */}
      {completedRecords.length > 0 && (
        <div className="card-medical">
          <div className="card-medical-header">
            <h3 className="text-lg font-semibold">Recently Completed</h3>
            <p className="text-sm text-muted-foreground">
              {completedRecords.length} record(s) ready for analysis
            </p>
          </div>
          <div className="card-medical-content">
            <div className="space-y-3">
              {completedRecords.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {record.original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Completed: {formatDate(record.processing_completed_at || record.created_at)}
                      </p>
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
                    <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Failed Records */}
      {failedRecords.length > 0 && (
        <div className="card-medical">
          <div className="card-medical-header">
            <h3 className="text-lg font-semibold">Failed Processing</h3>
            <p className="text-sm text-muted-foreground">
              {failedRecords.length} record(s) failed to process
            </p>
          </div>
          <div className="card-medical-content">
            <div className="space-y-3">
              {failedRecords.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {record.original_filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Failed: {formatDate(record.updated_at || record.created_at)}
                      </p>
                      {record.error_message && (
                        <p className="text-xs text-red-600 mt-1">
                          Error: {record.error_message}
                        </p>
                      )}
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
                    <button className="btn-medical-secondary px-3 py-1 text-xs">
                      Retry
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {records?.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No ECG records found</h3>
          <p className="text-muted-foreground mb-6">
            Upload your first ECG to start processing
          </p>
          <button className="btn-medical-primary px-6 py-2">
            Upload ECG
          </button>
        </div>
      )}
    </div>
  );
};

export default ProcessingPage;


