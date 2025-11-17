'use server';

import { db } from '@/lib/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { rootDomain, protocol } from '@/lib/utils';

export async function createSubdomainAction(
  prevState: any,
  formData: FormData
) {
  const subdomain = formData.get('subdomain') as string;

  if (!subdomain) {
    return { success: false, error: 'Subdomain name is required' };
  }

  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

  if (sanitizedSubdomain !== subdomain) {
    return {
      subdomain,
      success: false,
      error:
        'Subdomain can only have lowercase letters, numbers, and hyphens. Please try again.'
    };
  }

  if (sanitizedSubdomain.length < 1 || sanitizedSubdomain.length > 63) {
    return {
      subdomain,
      success: false,
      error: 'Subdomain must be between 1 and 63 characters long.'
    };
  }

  try {
    // Check if subdomain already exists
    const existingSubdomain = await db.query(
      'SELECT name FROM subdomains WHERE name = $1',
      [sanitizedSubdomain]
    );

    if (existingSubdomain.rows.length > 0) {
      return {
        subdomain,
        success: false,
        error: 'This subdomain is already taken'
      };
    }

    // Insert new subdomain
    await db.query(
      'INSERT INTO subdomains (name, created_at) VALUES ($1, $2)',
      [sanitizedSubdomain, Date.now()]
    );
  } catch (error) {
    console.error('Error creating subdomain:', error);
    return {
      subdomain,
      success: false,
      error: 'Failed to create subdomain. Please try again.'
    };
  }

  redirect(`${protocol}://${sanitizedSubdomain}.${rootDomain}`);
}

export async function deleteSubdomainAction(
  prevState: any,
  formData: FormData
) {
  const subdomain = formData.get('subdomain');

  try {
    await db.query('DELETE FROM subdomains WHERE name = $1', [subdomain]);
    revalidatePath('/admin');
    return { success: 'Domain deleted successfully' };
  } catch (error) {
    console.error('Error deleting subdomain:', error);
    return { success: false, error: 'Failed to delete domain' };
  }
}
