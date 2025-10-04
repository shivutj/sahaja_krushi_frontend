import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../lib/network/axiosClient';

type EscalatedQueryItem = {
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

const EscalatedQueryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<EscalatedQueryItem | null>(null);
  const [answering, setAnswering] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [answerStatus, setAnswerStatus] = useState<'answered' | 'closed'>('answered');
  const [saving, setSaving] = useState(false);

  const uploadsBase = 'http://localhost:3000/uploads';

  const fetchQuery = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosClient.get(`/queries/${id}`);
      setQuery(res.data.data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load query details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuery();
    }
  }, [id]);

  const handleAnswer = async () => {
    if (!query || !answerText.trim()) return;
    
    try {
      setSaving(true);
      await axiosClient.put(`/queries/${query.id}/answer`, {
        answer: answerText,
        status: answerStatus,
      });
      await fetchQuery(); // Refresh the query
      setAnswering(false);
      setAnswerText('');
    } catch (e: any) {
      alert(e?.message || 'Failed to submit answer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!query || !confirm('Are you sure you want to delete this escalated query?')) return;
    
    try {
      await axiosClient.delete(`/queries/${query.id}`);
      navigate('/superadmin/escalated-queries');
    } catch (e: any) {
      alert(e?.message || 'Failed to delete query');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading query details...</p>
        </div>
      </div>
    );
  }

  if (error || !query) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Query not found'}</p>
          <button
            onClick={() => navigate('/superadmin/escalated-queries')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Escalated Queries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Escalated Query Details</h1>
            <p className="text-gray-600">Query ID: #{query.id}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/superadmin/escalated-queries')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              ← Back to List
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete Query
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Query Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Query Information</h2>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  Escalated
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded border">
                    {query.description || 'No description provided'}
                  </p>
                </div>

                {query.title && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <p className="text-gray-900">{query.title}</p>
                  </div>
                )}

                {/* Media Files */}
                {(query.imagePath || query.audioPath || query.videoPath) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Media Files</label>
                    <div className="space-y-3">
                      {query.imagePath && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Image:</p>
                          <img
                            src={`${uploadsBase}/${query.imagePath}`}
                            alt="Query image"
                            className="max-w-full h-64 object-cover rounded border"
                          />
                        </div>
                      )}
                      
                      {query.audioPath && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Audio:</p>
                          <audio controls className="w-full">
                            <source src={`${uploadsBase}/${query.audioPath}`} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                      
                      {query.videoPath && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Video:</p>
                          <video controls className="w-full max-h-96">
                            <source src={`${uploadsBase}/${query.videoPath}`} type="video/mp4" />
                            Your browser does not support the video element.
                          </video>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Existing Answer */}
                {query.answer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Previous Answer</label>
                    <p className="text-gray-900 bg-green-50 p-3 rounded border">
                      {query.answer}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Answer Form */}
            {!answering ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Response</h3>
                  <button
                    onClick={() => setAnswering(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {query.answer ? 'Update Answer' : 'Add Answer'}
                  </button>
                </div>
                {query.answer ? (
                  <p className="text-gray-600">This query has already been answered. Click "Update Answer" to modify the response.</p>
                ) : (
                  <p className="text-gray-600">No answer provided yet. Click "Add Answer" to respond to this escalated query.</p>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Provide Answer</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={answerStatus}
                      onChange={(e) => setAnswerStatus(e.target.value as any)}
                      className="border rounded px-3 py-2 w-full"
                    >
                      <option value="answered">Answered</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      className="border rounded w-full p-3 h-32"
                      placeholder="Type your response to this escalated query..."
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleAnswer}
                      disabled={saving || !answerText.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Answer'}
                    </button>
                    <button
                      onClick={() => {
                        setAnswering(false);
                        setAnswerText('');
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Farmer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Farmer Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{query.farmer?.fullName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Farmer ID</label>
                  <p className="text-gray-900 font-mono">{query.farmer?.farmerId || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact</label>
                  <p className="text-gray-900">{query.farmer?.contactNumber || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">District</label>
                  <p className="text-gray-900">{query.farmer?.district || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <p className="text-gray-900">{query.farmer?.state || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Query Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-gray-900">{new Date(query.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Escalated</label>
                  <p className="text-gray-900">
                    {query.escalatedAt ? new Date(query.escalatedAt).toLocaleString() : 'Not escalated'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-gray-900">{new Date(query.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscalatedQueryDetail;
