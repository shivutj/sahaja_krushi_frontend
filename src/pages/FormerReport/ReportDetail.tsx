import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../lib/network/axiosClient';

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

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

  const fetchOne = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axiosClient.get(`/crop-reports/${encodeURIComponent(String(id))}`);
      setReport(res?.data?.data ?? null);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOne();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm('Delete this report? This cannot be undone.');
    if (!ok) return;
    try {
      setDeleting(true);
      await axiosClient.delete(`/crop-reports/${encodeURIComponent(String(id))}`);
      navigate('/admin/former-report/all');
    } catch (e: any) {
      alert(e?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600 text-lg">Loading...</div></div>;
  if (error || !report) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-red-600 text-lg">{error || 'Not found'}</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white border-l-4 border-green-600 shadow-sm mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Crop Report</div>
              <h1 className="text-xl font-bold text-gray-900">{report.cropName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-sm font-semibold text-xs uppercase tracking-wide ${
                report.status === 'active' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : report.status === 'completed' 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              }`}>{report.status}</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1 bg-red-600 text-white font-semibold text-xs uppercase tracking-wide rounded-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 shadow-sm p-6">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Crop Type</div>
            <div className="text-2xl font-bold text-gray-900">{report.cropType || 'General'}</div>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm p-6">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Area (ha)</div>
            <div className="text-2xl font-bold text-gray-900">{report.areaHectares ?? '-'}</div>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm p-6">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Planted</div>
            <div className="text-2xl font-bold text-gray-900">{report.plantingDate ? new Date(report.plantingDate).toLocaleDateString() : '-'}</div>
          </div>
        </div>

        {/* Stages Section */}
        <div className="bg-white border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Stages</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {(report.stages || []).map((s: any) => (
              <div key={s.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                      {s.stageOrder}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{s.stageName}</h3>
                      {s.stageDate ? (
                        <div className="text-sm text-gray-600">{new Date(s.stageDate).toLocaleDateString()}</div>
                      ) : null}
                    </div>
                  </div>
                  {((s.photos || []).length > 0 || s.isCompleted) && (
                    <span className="px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
                      Completed
                    </span>
                  )}
                </div>
                
                {(s.photos || []).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 flex-wrap">
                      {(s.photos || []).map((p: any) => (
                        <a 
                          key={p.id} 
                          href={`${uploadsBase}/${p.photoPath}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          title={p.photoDescription || ''}
                          className="group relative block"
                        >
                          <img 
                            src={`${uploadsBase}/${p.photoPath}`} 
                            alt="stage" 
                            className="w-32 h-32 object-cover border-2 border-gray-200 group-hover:border-green-600 transition-colors" 
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity"></div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <div className="border-t border-gray-200 pt-4">
            Official Crop Management Report
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;