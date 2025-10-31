import React from 'react';
import { useQuery } from 'react-query';
import { 
  Activity, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Heart,
  Clock,
  FileText
} from 'lucide-react';
import { ecgService } from '../services/api';
import ECGChart from '../components/ECGChart';
import StatusCard from '../components/StatusCard';
import RecentRecords from '../components/RecentRecords';

const Dashboard: React.FC = () => {
  const { data: records, isLoading } = useQuery('ecg-records', ecgService.getRecords);

  const stats = React.useMemo(() => {
    if (!records) return null;

    const total = records.length;
    const completed = records.filter(r => r.status === 'completed').length;
    const processing = records.filter(r => r.status === 'processing').length;
    const failed = records.filter(r => r.status === 'failed').length;

    return { total, completed, processing, failed };
  }, [records]);

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
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your ECG processing and analysis results
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Total Records"
          value={stats?.total || 0}
          icon={FileText}
          color="blue"
        />
        <StatusCard
          title="Completed"
          value={stats?.completed || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatusCard
          title="Processing"
          value={stats?.processing || 0}
          icon={Clock}
          color="yellow"
        />
        <StatusCard
          title="Failed"
          value={stats?.failed || 0}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Charts and Recent Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ECG Chart */}
        <div className="card-medical">
          <div className="card-medical-header">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-medical-primary" />
              <h3 className="text-lg font-semibold">Recent ECG Signal</h3>
            </div>
          </div>
          <div className="card-medical-content">
            <ECGChart 
              data={records?.find(r => r.status === 'completed')?.id}
              height={300}
            />
          </div>
        </div>

        {/* Recent Records */}
        <div className="card-medical">
          <div className="card-medical-header">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-medical-primary" />
              <h3 className="text-lg font-semibold">Recent Records</h3>
            </div>
          </div>
          <div className="card-medical-content">
            <RecentRecords records={records?.slice(0, 5) || []} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-medical">
        <div className="card-medical-header">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </div>
        <div className="card-medical-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn-medical-primary p-4 rounded-lg flex items-center space-x-3">
              <Upload className="w-5 h-5" />
              <span>Upload New ECG</span>
            </button>
            <button className="btn-medical-secondary p-4 rounded-lg flex items-center space-x-3">
              <Activity className="w-5 h-5" />
              <span>View Processing</span>
            </button>
            <button className="btn-medical-secondary p-4 rounded-lg flex items-center space-x-3">
              <Heart className="w-5 h-5" />
              <span>Analyze Results</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


