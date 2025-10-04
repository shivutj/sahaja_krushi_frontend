import React, { useEffect, useMemo, useState } from 'react';
import axiosClient from '../../lib/network/axiosClient';
import DynamicTable from '../../components/DynamicTable';

type CropStagePhoto = {
  id: number | string;
  photoPath: string;
  photoDescription?: string | null;
  uploadedAt: string;
};

type CropStage = {
  id: number | string;
  stageName: string;
  stageOrder: number;
  isCompleted: boolean;
  stageDate?: string | null;
  photos?: CropStagePhoto[];
};

type CropReport = {
  id: number;
  cropName: string;
  cropType?: string | null;
  areaHectares?: number | null;
  plantingDate?: string | null;
  status: 'active' | 'completed' | 'abandoned';
  stages?: CropStage[];
  createdAt: string;
  updatedAt: string;
  farmer?: {
    id: number;
    farmerId: string;
    fullName?: string | null;
    contactNumber?: string | null;
  };
};

const AllReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CropReport[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'abandoned'>('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const uploadsBase = useMemo(() => {
    try {
      const base = (axiosClient.defaults as any).baseURL as string | undefined;
      if (base) {
        const u = new URL(base);
        return `${u.protocol}//${u.hostname}:${u.port || '3000'}/uploads`;
      }
    } catch {}
    return 'http://localhost:3000/uploads';
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/crop-reports');
      const data = res?.data?.data ?? [];
      setItems(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load crop reports');
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId: number) => {
    const ok = window.confirm(`Delete report #${reportId}? This cannot be undone.`);
    if (!ok) return;
    try {
      setDeletingId(reportId);
      await axiosClient.delete(`/crop-reports/${reportId}`);
      await fetchAll();
    } catch (e: any) {
      alert(e?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter(i => i.status === filter);
  }, [items, filter]);
  const shownCount = filtered.length;

  const columns = [
    {
      key: 'farmer',
      label: 'Farmer',
      render: (_: any, record: CropReport) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.farmer?.fullName || '-'}</span>
          <span className="text-xs text-gray-500">{record.farmer?.farmerId}</span>
        </div>
      ),
    },
    {
      key: 'crop',
      label: 'Crop',
      render: (_: any, record: CropReport) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.cropName}</span>
          <span className="text-xs text-gray-500">{record.cropType || 'General'}</span>
        </div>
      ),
    },
    {
      key: 'area',
      label: 'Area (ha)',
      render: (_: any, record: CropReport) => record.areaHectares ?? '-',
    },
    {
      key: 'planting',
      label: 'Planted',
      render: (_: any, record: CropReport) => record.plantingDate ? new Date(record.plantingDate).toLocaleDateString() : '-',
    },
    {
      key: 'media',
      label: 'Latest Photo',
      render: (_: any, record: CropReport) => {
        const stages = record.stages || [];
        const withPhotos = stages.filter(s => (s.photos?.length || 0) > 0);
        const lastStage = withPhotos[withPhotos.length - 1];
        const lastPhoto = lastStage?.photos?.[lastStage.photos.length - 1];
        return lastPhoto ? (
          <a href={`${uploadsBase}/${lastPhoto.photoPath}`} target="_blank" rel="noreferrer" title={lastPhoto.photoDescription || ''}>
            <img src={`${uploadsBase}/${lastPhoto.photoPath}`} alt="stage" className="w-10 h-10 object-cover rounded border" />
          </a>
        ) : <span className="text-xs text-gray-400">-</span>;
      },
    },
    {
      key: 'stages',
      label: 'Stages',
      render: (_: any, record: CropReport) => `${record.stages?.length || 0}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, record: CropReport) => (
        <span
          className={`inline-block px-2 py-1 rounded text-xs ${
            record.status === 'active'
              ? 'bg-blue-100 text-blue-800'
              : record.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {record.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (_: any, record: CropReport) => (
        <span className="text-xs text-gray-600">{new Date(record.createdAt).toLocaleString()}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, record: CropReport) => (
        <div className="space-x-2">
          <a
            href={`/admin/former-report/${record.id}`}
            className="px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-800"
          >
            View
          </a>
          <button
            onClick={() => deleteReport(record.id)}
            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-60"
            disabled={deletingId === record.id}
          >
            {deletingId === record.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-green-700">Former Crop Reports</h2>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>
            <button
              onClick={fetchAll}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-100">
          <DynamicTable columns={columns} data={filtered} label={"Former Crop Reports"} rowKey="id" pagination={{ current: 1, total: shownCount, pageSize: shownCount || 1 }} />
          {loading && (
            <div className="p-4 text-sm text-gray-500">Loading...</div>
          )}
          {error && !loading && (
            <div className="p-4 text-sm text-red-600">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllReports;


