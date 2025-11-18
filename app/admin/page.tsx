import { getAllSubdomains } from '@/lib/subdomains';
import { getAllCollectionCounts } from '@/lib/collections';
import type { Metadata } from 'next';
import { AdminDashboard } from './dashboard';
import { rootDomain } from '@/lib/utils';

export const metadata: Metadata = {
  title: `Admin Dashboard | ${rootDomain}`,
  description: `Manage API endpoints for ${rootDomain}`
};

export default async function AdminPage() {
  // TODO: You can add authentication here with your preferred auth provider
  const subdomains = await getAllSubdomains();
  const collectionCounts = await getAllCollectionCounts();

  // Merge collection counts with subdomain data
  const tenants = subdomains.map(subdomain => ({
    ...subdomain,
    collectionCount: collectionCounts[subdomain.subdomain] || 0
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <AdminDashboard tenants={tenants} />
    </div>
  );
}
