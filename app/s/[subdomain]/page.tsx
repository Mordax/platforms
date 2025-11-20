import { getSubdomainData } from '@/lib/subdomains';
import { getCollectionsWithCounts } from '@/lib/collections';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DataManager } from './data-manager';
import { protocol, rootDomain } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
    title: `${subdomain} | Multi-Collection API`,
    description: `Manage API collections for ${subdomain}`
  };
}

export default async function SubdomainPage({ params }: Props) {
  const { subdomain } = await params;
  const subdomainData = await getSubdomainData(subdomain);

  if (!subdomainData) {
    notFound();
  }

  const collections = await getCollectionsWithCounts(subdomain);
  const totalDocuments = collections.reduce((sum, c) => sum + c.documentCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="mb-8">
          <Link
            href={`${protocol}://${rootDomain}`}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {subdomain}
          </h1>
          <p className="text-gray-600 mb-4">
            Multi-Collection REST API Project
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              <span className="font-semibold text-gray-700">{collections.length}</span> collections
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              <span className="font-semibold text-gray-700">{totalDocuments}</span> total documents
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              Created {new Date(subdomainData.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">API Usage</h2>
          <div className="space-y-3 font-mono text-xs md:text-sm">
            <div>
              <div className="text-xs text-gray-500 mb-1">Create/List documents in a collection:</div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="text-green-600 font-semibold sm:w-16">GET</span>
                <code className="bg-gray-100 px-3 py-1 rounded flex-1 overflow-x-auto break-all">
                  {protocol}://{subdomain}.{rootDomain}/api/collection-name
                </code>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
                <span className="text-blue-600 font-semibold sm:w-16">POST</span>
                <code className="bg-gray-100 px-3 py-1 rounded flex-1 overflow-x-auto break-all">
                  {protocol}://{subdomain}.{rootDomain}/api/collection-name
                </code>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Get/Update/Delete specific document:</div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <span className="text-green-600 font-semibold sm:w-16">GET</span>
                <code className="bg-gray-100 px-3 py-1 rounded flex-1 overflow-x-auto break-all">
                  {protocol}://{subdomain}.{rootDomain}/api/collection-name/:id
                </code>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
                <span className="text-yellow-600 font-semibold sm:w-16">PUT</span>
                <code className="bg-gray-100 px-3 py-1 rounded flex-1 overflow-x-auto break-all">
                  {protocol}://{subdomain}.{rootDomain}/api/collection-name/:id
                </code>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
                <span className="text-red-600 font-semibold sm:w-16">DELETE</span>
                <code className="bg-gray-100 px-3 py-1 rounded flex-1 overflow-x-auto break-all">
                  {protocol}://{subdomain}.{rootDomain}/api/collection-name/:id
                </code>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-800">
            <strong>Note:</strong> Collections are auto-created on first POST. Just send data to any collection name you want!
          </div>
        </div>

        <DataManager subdomain={subdomain} initialCollections={collections} />
      </div>
    </div>
  );
}
