'use server';

import { db } from '@/lib/postgres';
import { isValidIcon } from '@/lib/subdomains';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { rootDomain, protocol } from '@/lib/utils';

export async function createSubdomainAction(
  prevState: any,
  formData: FormData
) {
  const subdomain = formData.get('subdomain') as string;
  const icon = formData.get('icon') as string;

  if (!subdomain || !icon) {
    return { success: false, error: 'Subdomain and icon are required' };
  }

  if (!isValidIcon(icon)) {
    return {
      subdomain,
      icon,
      success: false,
      error: 'Please enter a valid emoji (maximum 10 characters)'
    };
  }

  const sanitizedSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

  if (sanitizedSubdomain !== subdomain) {
    return {
      subdomain,
      icon,
      success: false,
      error:
        'Subdomain can only have lowercase letters, numbers, and hyphens. Please try again.'
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
        icon,
        success: false,
        error: 'This subdomain is already taken'
      };
    }

    // Insert new subdomain
    await db.query(
      'INSERT INTO subdomains (name, emoji, created_at) VALUES ($1, $2, $3)',
      [sanitizedSubdomain, icon, Date.now()]
    );
  } catch (error) {
    console.error('Error creating subdomain:', error);
    return {
      subdomain,
      icon,
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
