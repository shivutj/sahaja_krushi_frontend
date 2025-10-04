import React, { useEffect, useMemo, useState } from 'react';
import axiosClient from '../../lib/network/axiosClient';
import DynamicTable from '../../components/DynamicTable';

type QueryItem = {
  id: number;
  title?: string | null;
  description?: string | null;
  imagePath?: string | null;
  audioPath?: string | null;
  videoPath?: string | null;
  status: 'open' | 'answered' | 'closed' | 'escalated';
  escalatedAt?: string | null;
  createdAt: string;
  farmer?: {
    id: number;
    farmerId: string;
    fullName?: string | null;
    contactNumber: string;
    district?: string | null;
    state?: string | null;
  };
};

const SuperAdminEscalatedQueries: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<QueryItem[]>([]);
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
      const res = await axiosClient.get('/queries/escalated');
      const data = res?.data?.data ?? [];
      setItems(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load escalated queries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const deleteQuery = async (id: number) => {
    if (!confirm('Are you sure you want to delete this escalated query?')) return;
    
    try {
      setDeletingId(id);
      await axiosClient.delete(`/queries/${id}`);
      await fetchAll(); // Refresh the list
    } catch (e: any) {
      alert(e?.message || 'Failed to delete query');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: 'farmer',
      label: 'Farmer',
      render: (_: any, record: QueryItem) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.farmer?.fullName || '-'}</span>
          <span className="text-xs text-gray-500">{record.farmer?.farmerId}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (_: any, record: QueryItem) => record.farmer?.contactNumber || '-',
    },
    {
      key: 'description',
      label: 'Description',
      render: (_: any, record: QueryItem) => (
        <span className="max-w-xs truncate block" title={record.description || ''}>{record.description || '-'}</span>
      ),
    },
    {
      key: 'media',
      label: 'Media',
      render: (_: any, r: QueryItem) => (
        <div className="flex items-center gap-2">
          {r.imagePath ? (
            <a href={`${uploadsBase}/${r.imagePath}`} target="_blank" rel="noreferrer" title={r.imagePath}>
              <img src={`${uploadsBase}/${r.imagePath}`} alt="img" className="w-10 h-10 object-cover rounded border" />
            </a>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
          <div className="flex flex-col text-xs">
            {r.audioPath ? (
              <a className="text-blue-600 hover:underline" href={`${uploadsBase}/${r.audioPath}`} target="_blank" rel="noreferrer">Audio</a>
            ) : null}
            {r.videoPath ? (
              <a className="text-blue-600 hover:underline" href={`${uploadsBase}/${r.videoPath}`} target="_blank" rel="noreferrer">Video</a>
            ) : null}
          </div>
        </div>
      )
    },
    {
      key: 'escalatedAt',
      label: 'Escalated',
      render: (_: any, r: QueryItem) => (
        <span className="text-xs text-gray-600">{r.escalatedAt ? new Date(r.escalatedAt).toLocaleString() : '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, r: QueryItem) => (
        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
          {r.status === 'escalated' ? 'escalated' : r.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, r: QueryItem) => (
        <div className="flex gap-2">
          <a href={`/superadmin/escalated-queries/${r.id}`} className="px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-800">View</a>
          <button
            onClick={() => deleteQuery(r.id)}
            disabled={deletingId === r.id}
            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
          >
            {deletingId === r.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-green-700">Escalated Queries</h2>
          <button onClick={fetchAll} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Refresh</button>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-100">
          <DynamicTable columns={columns as any} data={items} rowKey="id" label="Escalated Queries" pagination={{ current: 1, total: items.length, pageSize: items.length || 1 }} />
          {loading && <div className="p-4 text-sm text-gray-500">Loading...</div>}
          {error && !loading && <div className="p-4 text-sm text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminEscalatedQueries;


