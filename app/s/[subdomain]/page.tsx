import { getSubdomainData } from '@/lib/subdomains';
import { getDocumentCount } from '@/lib/documents';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DataManager } from './data-manager';

type Props = {
  params: Promise<{ subdomain: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params;
  const data = await getSubdomainData(subdomain);

  if (!data) {
    return {
      title: 'Not Found'
    };
  }

  return {
    title: `${subdomain} API | REST Endpoint`,
    description: `Manage JSON documents for ${subdomain} via REST API`
  };
}

export default async function SubdomainPage({ params }: Props) {
  const { subdomain } = await params;
  const subdomainData = await getSubdomainData(subdomain);

  if (!subdomainData) {
    notFound();
  }

  const documentCount = await getDocumentCount(subdomain);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {subdomain}
          </h1>
          <p className="text-gray-600 mb-4">
            REST API Endpoint for JSON Documents
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              <span className="font-semibold text-gray-700">{documentCount}</span> documents
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              Created {new Date(subdomainData.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">API Endpoints</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center gap-3">
              <span className="text-green-600 font-semibold w-16">GET</span>
              <code className="bg-gray-100 px-3 py-1 rounded flex-1">/api/{subdomain}</code>
              <span className="text-gray-500 text-xs">List all documents</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-blue-600 font-semibold w-16">POST</span>
              <code className="bg-gray-100 px-3 py-1 rounded flex-1">/api/{subdomain}</code>
              <span className="text-gray-500 text-xs">Create document</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-600 font-semibold w-16">GET</span>
              <code className="bg-gray-100 px-3 py-1 rounded flex-1">/api/{subdomain}/:id</code>
              <span className="text-gray-500 text-xs">Get one document</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-yellow-600 font-semibold w-16">PUT</span>
              <code className="bg-gray-100 px-3 py-1 rounded flex-1">/api/{subdomain}/:id</code>
              <span className="text-gray-500 text-xs">Update document</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-red-600 font-semibold w-16">DELETE</span>
              <code className="bg-gray-100 px-3 py-1 rounded flex-1">/api/{subdomain}/:id</code>
              <span className="text-gray-500 text-xs">Delete document</span>
            </div>
          </div>
        </div>

        <DataManager subdomain={subdomain} />
      </div>
    </div>
  );
}
