import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Download, 
  Share2, 
  Heart, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText
} from 'lucide-react';
import { ecgService, processingService, exportService } from '../services/api';
import ECGChart from '../components/ECGChart';
import StatusCard from '../components/StatusCard';
import toast from 'react-hot-toast';

const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const recordId = parseInt(id || '0');

  const { data: record, isLoading: recordLoading } = useQuery(
    ['ecg-record', recordId],
    () => ecgService.getRecord(recordId),
    { enabled: !!recordId }
  );

  const { data: results, isLoading: resultsLoading } = useQuery(
    ['processing-results', recordId],
    () => processingService.getResults(recordId),
    { enabled: !!recordId }
  );

  const handleExport = async (format: 'csv' | 'json' | 'excel' | 'numpy') => {
    try {
      const response = await exportService.exportData({
        ecg_record_id: recordId,
        format,
        include_metadata: true,
        include_anomalies: true,
      });
      
      // Download the file
      const blob = await exportService.downloadFile(response.filename);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  if (recordLoading || resultsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">ECG record not found</h3>
        <p className="text-muted-foreground">
          The requested ECG record could not be found.
        </p>
      </div>
    );
  }

  const latestResult = results?.[0];
  const waveformData = latestResult?.waveform_data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ECG Analysis Results</h1>
          <p className="text-muted-foreground mt-2">
            {record.original_filename}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExport('csv')}
            className="btn-medical-secondary px-4 py-2 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="btn-medical-secondary px-4 py-2 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
          <button className="btn-medical-primary px-4 py-2 flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Status and Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatusCard
          title="Heart Rate"
          value={latestResult?.heart_rate ? `${Math.round(latestResult.heart_rate)} BPM` : 'N/A'}
          icon={Heart}
          color="red"
        />
        <StatusCard
          title="Signal Quality"
          value={latestResult?.signal_quality_score ? `${Math.round(latestResult.signal_quality_score * 100)}%` : 'N/A'}
          icon={Activity}
          color="green"
        />
        <StatusCard
          title="Rhythm Type"
          value={latestResult?.rhythm_type || 'Unknown'}
          icon={TrendingUp}
          color="blue"
        />
        <StatusCard
          title="Anomalies"
          value={latestResult?.anomalies_detected?.length || 0}
          icon={AlertTriangle}
          color="yellow"
        />
      </div>

      {/* ECG Waveform Chart */}
      {waveformData && (
        <div className="card-medical">
          <div className="card-medical-header">
            <h3 className="text-lg font-semibold">ECG Waveform</h3>
            <p className="text-sm text-muted-foreground">
              Extracted signal with {waveformData.signal_length} data points
            </p>
          </div>
          <div className="card-medical-content">
            <ECGChart 
              data={waveformData.signal}
              height={400}
              showGrid={true}
              showPoints={false}
              color="#3b82f6"
            />
          </div>
        </div>
      )}

      {/* Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signal Analysis */}
        <div className="card-medical">
          <div className="card-medical-header">
            <h3 className="text-lg font-semibold">Signal Analysis</h3>
          </div>
          <div className="card-medical-content">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Sampling Rate</span>
                <span className="text-sm font-medium">
                  {waveformData?.sampling_rate || 'N/A'} Hz
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Signal Length</span>
                <span className="text-sm font-medium">
                  {waveformData?.signal_length || 'N/A'} points
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="text-sm font-medium">
                  {waveformData ? `${(waveformData.signal_length / waveformData.sampling_rate).toFixed(2)}s` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Quality Score</span>
                <span className="text-sm font-medium">
                  {latestResult?.signal_quality_score ? `${Math.round(latestResult.signal_quality_score * 100)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Anomalies Detection */}
        <div className="card-medical">
          <div className="card-medical-header">
            <h3 className="text-lg font-semibold">Anomalies Detected</h3>
          </div>
          <div className="card-medical-content">
            {latestResult?.anomalies_detected && latestResult.anomalies_detected.length > 0 ? (
              <div className="space-y-3">
                {latestResult.anomalies_detected.map((anomaly: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {anomaly.type || 'Unknown Anomaly'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {anomaly.description || 'No description available'}
                      </p>
                      {anomaly.severity && (
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                          anomaly.severity === 'high' ? 'bg-red-100 text-red-800' :
                          anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {anomaly.severity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No anomalies detected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  The ECG signal appears to be normal
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Processing Information */}
      <div className="card-medical">
        <div className="card-medical-header">
          <h3 className="text-lg font-semibold">Processing Information</h3>
        </div>
        <div className="card-medical-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">File Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Original File</span>
                  <span className="text-sm font-medium">{record.original_filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">File Size</span>
                  <span className="text-sm font-medium">
                    {(record.file_size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">File Type</span>
                  <span className="text-sm font-medium">{record.file_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Uploaded</span>
                  <span className="text-sm font-medium">
                    {new Date(record.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Processing Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    record.status === 'completed' ? 'bg-green-100 text-green-800' :
                    record.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    record.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {record.status}
                  </span>
                </div>
                {record.processing_started_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Started</span>
                    <span className="text-sm font-medium">
                      {new Date(record.processing_started_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {record.processing_completed_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="text-sm font-medium">
                      {new Date(record.processing_completed_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {record.error_message && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Error</span>
                    <span className="text-sm font-medium text-red-600">
                      {record.error_message}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;


