'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Loader2, Plus, Edit2, X } from 'lucide-react';

type Document = {
  id: number;
  data: any;
  created_at: string;
  updated_at: string;
};

export function DataManager({ subdomain }: { subdomain: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/${subdomain}`);
      const data = await res.json();
      setDocuments(data.data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [subdomain]);

  const handleCreate = async () => {
    setError('');
    try {
      const parsed = JSON.parse(jsonInput);
      const res = await fetch(`/api/${subdomain}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });

      if (!res.ok) {
        const error = await res.json();
        setError(error.error || 'Failed to create document');
        return;
      }

      setJsonInput('');
      fetchDocuments();
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const handleUpdate = async (id: number) => {
    setError('');
    try {
      const parsed = JSON.parse(jsonInput);
      const res = await fetch(`/api/${subdomain}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });

      if (!res.ok) {
        const error = await res.json();
        setError(error.error || 'Failed to update document');
        return;
      }

      setEditingId(null);
      setJsonInput('');
      fetchDocuments();
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await fetch(`/api/${subdomain}/${id}`, { method: 'DELETE' });
      fetchDocuments();
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const startEdit = (doc: Document) => {
    setEditingId(doc.id);
    setJsonInput(JSON.stringify(doc.data, null, 2));
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setJsonInput('');
    setError('');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="json-input">JSON Data</Label>
              <textarea
                id="json-input"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"name": "John Doe", "email": "john@example.com"}'
                className="w-full min-h-[120px] p-3 border rounded-md font-mono text-sm"
                disabled={editingId !== null}
              />
            </div>
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            <Button
              onClick={handleCreate}
              disabled={!jsonInput.trim() || editingId !== null}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          Documents ({documents.length})
        </h2>

        {documents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No documents yet. Create one above to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Document #{doc.id}</CardTitle>
                    <div className="flex gap-2">
                      {editingId === doc.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(doc.id)}
                            disabled={!jsonInput.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(doc)}
                            disabled={editingId !== null}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(doc.id)}
                            disabled={editingId !== null}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingId === doc.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className="w-full min-h-[120px] p-3 border rounded-md font-mono text-sm"
                      />
                      {error && (
                        <div className="text-sm text-red-600">{error}</div>
                      )}
                    </div>
                  ) : (
                    <>
                      <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
                        <code>{JSON.stringify(doc.data, null, 2)}</code>
                      </pre>
                      <div className="flex gap-4 mt-3 text-xs text-gray-500">
                        <span>Created: {new Date(doc.created_at).toLocaleString()}</span>
                        <span>Updated: {new Date(doc.updated_at).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
