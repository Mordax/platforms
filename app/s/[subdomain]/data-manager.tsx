'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Loader2, Plus, Edit2, X, Database } from 'lucide-react';

type Document = {
  id: number;
  collection_name: string;
  data: any;
  created_at: string;
  updated_at: string;
};

type Collection = {
  id: number;
  name: string;
  documentCount: number;
  created_at: string;
};

export function DataManager({
  subdomain,
  initialCollections
}: {
  subdomain: string;
  initialCollections: Collection[];
}) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [activeCollection, setActiveCollection] = useState<string | null>(
    initialCollections.length > 0 ? initialCollections[0].name : null
  );
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);

  const fetchDocuments = async (collection: string) => {
    if (!collection) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/${collection}`);
      const data = await res.json();
      setDocuments(data.data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCollection) {
      fetchDocuments(activeCollection);
    }
  }, [activeCollection]);

  const handleCreate = async () => {
    if (!activeCollection) return;

    setError('');
    try {
      const parsed = JSON.parse(jsonInput);
      const res = await fetch(`/api/${activeCollection}`, {
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
      fetchDocuments(activeCollection);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!activeCollection) return;

    setError('');
    try {
      const parsed = JSON.parse(jsonInput);
      const res = await fetch(`/api/${activeCollection}/${id}`, {
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
      fetchDocuments(activeCollection);
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const handleDelete = async (id: number) => {
    if (!activeCollection) return;
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await fetch(`/api/${activeCollection}/${id}`, { method: 'DELETE' });
      fetchDocuments(activeCollection);
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

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    setCreatingCollection(true);
    setError('');

    try {
      // Create a collection by posting an empty document (will be auto-created)
      const res = await fetch(`/api/${newCollectionName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _temp: 'placeholder' }) // Temporary document
      });

      if (!res.ok) {
        const error = await res.json();
        setError(error.error || 'Failed to create collection');
        setCreatingCollection(false);
        return;
      }

      // Refresh the page to show the new collection
      window.location.reload();
    } catch (err) {
      setError('Failed to create collection');
      setCreatingCollection(false);
    }
  };

  if (collections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Your First Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="users"
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lowercase alphanumeric with hyphens only (e.g., users, blog-posts, events)
              </p>
            </div>
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            <Button
              onClick={handleCreateCollection}
              disabled={!newCollectionName.trim() || creatingCollection}
              className="w-full"
            >
              {creatingCollection ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Collection
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Collection Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center pb-2">
          <div className="flex gap-2 overflow-x-auto">
            {collections.map((collection) => (
              <button
                key={collection.name}
                onClick={() => setActiveCollection(collection.name)}
                className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors whitespace-nowrap ${
                  activeCollection === collection.name
                    ? 'bg-white border border-b-0 border-gray-200 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {collection.name}
                <span className="ml-2 text-xs text-gray-500">
                  ({collection.documentCount})
                </span>
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCreatingCollection(true)}
            disabled={creatingCollection}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Collection
          </Button>
        </div>
      </div>

      {/* New Collection Form (when creating) */}
      {creatingCollection && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Create New Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-collection-name">Collection Name</Label>
                <Input
                  id="new-collection-name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="events"
                  className="font-mono"
                  autoFocus
                />
                <p className="text-xs text-gray-600 mt-1">
                  Lowercase alphanumeric with hyphens (e.g., blog-posts, user-profiles)
                </p>
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim()}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreatingCollection(false);
                    setNewCollectionName('');
                    setError('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Document Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Document in "{activeCollection}"</CardTitle>
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

      {/* Documents List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          Documents ({documents.length})
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No documents in this collection yet. Create one above!
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
