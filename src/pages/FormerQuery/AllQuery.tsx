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
  answer?: string | null;
  escalatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  farmer?: {
    id: number;
    farmerId: string;
    fullName?: string | null;
    contactNumber: string;
    district?: string | null;
    state?: string | null;
  };
};

const AllQuery: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<QueryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'answered' | 'closed' | 'escalated'>('all');
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerStatus, setAnswerStatus] = useState<'answered' | 'closed'>('answered');
  const [saving, setSaving] = useState(false);

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
      const res = await axiosClient.get('/queries');
      const data = res?.data?.data ?? [];
      setItems(data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') {
      // Hide escalated queries from admin - only show non-escalated queries
      return items.filter(i => i.status !== 'escalated');
    }
    if (filter === 'escalated') {
      // Show only escalated queries (with escalatedAt not null)
      return items.filter(i => i.escalatedAt);
    }
    return items.filter(i => i.status === filter && i.status !== 'escalated');
  }, [items, filter]);
  const shownCount = filtered.length;

  const startAnswer = (q: QueryItem) => {
    setAnsweringId(q.id);
    setAnswerText(q.answer || '');
    setAnswerStatus(q.status === 'closed' ? 'closed' : 'answered');
  };

  const submitAnswer = async () => {
    if (!answeringId) return;
    try {
      setSaving(true);
      await axiosClient.put(`/queries/${answeringId}/answer`, {
        answer: answerText,
        status: answerStatus,
      });
      await fetchAll();
      setAnsweringId(null);
      setAnswerText('');
    } catch (e: any) {
      alert(e?.message || 'Failed to submit answer');
    } finally {
      setSaving(false);
    }
  };

  // Table columns for DynamicTable
  const getColumns = (showActions: boolean = true) => [
    // {
    //   key: 'id',
    //   label: 'ID',
    //   dataIndex: 'id',
    // },
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
    // {
    //   key: 'description',
    //   label: 'Description',
    //   render: (_: any, record: QueryItem) => (
    //     <span className="max-w-xs truncate block" title={record.description || ''}>{record.description || '-'}</span>
    //   ),
    // },
    {
      key: 'media',
      label: 'Media',
      render: (_: any, record: QueryItem) => (
        <div className="flex items-center gap-2">
          {record.imagePath ? (
            <a href={`${uploadsBase}/${record.imagePath}`} target="_blank" rel="noreferrer" title={record.imagePath}>
              <img src={`${uploadsBase}/${record.imagePath}`} alt="img" className="w-10 h-10 object-cover rounded border" />
            </a>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )}
          <div className="flex flex-col text-xs">
            {record.audioPath ? (
              <a className="text-blue-600 hover:underline" href={`${uploadsBase}/${record.audioPath}`} target="_blank" rel="noreferrer">Audio</a>
            ) : null}
            {record.videoPath ? (
              <a className="text-blue-600 hover:underline" href={`${uploadsBase}/${record.videoPath}`} target="_blank" rel="noreferrer">Video</a>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (_: any, record: QueryItem) => (
        <span className="text-xs text-gray-600">{new Date(record.createdAt).toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, record: QueryItem) => (
        <span
          className={`inline-block px-2 py-1 rounded text-xs ${
            record.escalatedAt
              ? 'bg-red-100 text-red-800'
              : record.status === 'open'
              ? 'bg-yellow-100 text-yellow-800'
              : record.status === 'answered'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {record.escalatedAt ? 'escalated' : record.status}
        </span>
      ),
    },
    // {
    //   key: 'answer',
    //   label: 'Answer',
    //   render: (_: any, record: QueryItem) => (
    //     <span className="max-w-xs truncate block" title={record.answer || ''}>{record.answer || '-'}</span>
    //   ),
    // },
    ...(showActions ? [{
      key: 'actions',
      label: 'Actions',
      render: (_: any, record: QueryItem) => (
        <div className="space-x-2">
          <a
            href={`/admin/former-query/${record.id}`}
            className="px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-800"
          >
            View
          </a>
          <button
            onClick={() => startAnswer(record)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Answer
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-green-700">Farmer Queries</h2>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="answered">Answered</option>
              <option value="closed">Closed</option>
              <option value="escalated">Escalated</option>
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
          <DynamicTable
            columns={getColumns(filter !== 'escalated')}
            data={filtered}
            label={filter === 'escalated' ? "Escalated Queries" : "Farmer Queries"}
            rowKey="id"
            pagination={{ current: 1, total: shownCount, pageSize: shownCount || 1 }}
          />
          {loading && (
            <div className="p-4 text-sm text-gray-500">Loading...</div>
          )}
          {error && !loading && (
            <div className="p-4 text-sm text-red-600">{error}</div>
          )}
        </div>
      </div>

      {answeringId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Answer Query #{answeringId}</h3>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={answerStatus}
              onChange={(e) => setAnswerStatus(e.target.value as any)}
              className="border rounded px-2 py-1 text-sm mb-3 w-full"
            >
              <option value="answered">answered</option>
              <option value="closed">closed</option>
            </select>
            <label className="block text-sm font-medium mb-1">Answer</label>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="border rounded w-full p-2 h-32 text-sm"
              placeholder="Type your answer..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setAnsweringId(null)}
                className="px-3 py-1 rounded border text-sm"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={submitAnswer}
                className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllQuery;

