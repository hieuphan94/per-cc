'use server'

// Server actions for WordPress Monitor module
// Handles: add site, delete site, check uptime (single + all)

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

function revalidateWp() {
  revalidatePath('/vi/wordpress')
  revalidatePath('/en/wordpress')
}

// Ping a URL — returns 'online' | 'offline' | 'warning'
// warning = responded but with an error status code (4xx/5xx)
async function pingUrl(url: string): Promise<'online' | 'offline' | 'warning'> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timeout)
    if (res.ok) return 'online'
    return 'warning'
  } catch {
    return 'offline'
  }
}

// Add a new WordPress site
export async function addSite(formData: FormData): Promise<{ error?: string }> {
  const name = (formData.get('name') as string | null)?.trim()
  const url  = (formData.get('url')  as string | null)?.trim()
  if (!name || !url) return { error: 'Name and URL are required' }

  // Normalise — ensure protocol prefix
  const normalised = url.startsWith('http') ? url : `https://${url}`

  const wp_user        = (formData.get('wp_user')        as string | null)?.trim() || null
  const wp_app_password = (formData.get('wp_app_password') as string | null)?.trim() || null
  const domain_expiry_at = (formData.get('domain_expiry_at') as string | null) || null

  const supabase = createAdminClient()
  const { error } = await supabase.from('wordpress_sites').insert({
    name,
    url: normalised,
    wp_user,
    wp_app_password,
    domain_expiry_at,
  })

  if (error) return { error: error.message }
  revalidateWp()
  return {}
}

// Delete a site by id
export async function deleteSite(id: string): Promise<{ error?: string }> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('wordpress_sites').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidateWp()
  return {}
}

// Check uptime for a single site and persist the result
export async function checkSite(id: string): Promise<{ status: string; error?: string }> {
  const supabase = createAdminClient()

  const { data: site } = await supabase
    .from('wordpress_sites')
    .select('url')
    .eq('id', id)
    .single()

  if (!site) return { status: 'unknown', error: 'Site not found' }

  const status = await pingUrl(site.url)

  await supabase
    .from('wordpress_sites')
    .update({ last_status: status, last_checked_at: new Date().toISOString() })
    .eq('id', id)

  revalidateWp()
  return { status }
}

// Check all active sites concurrently and persist results
export async function checkAllSites(): Promise<{ checked: number; error?: string }> {
  const supabase = createAdminClient()

  const { data: sites, error } = await supabase
    .from('wordpress_sites')
    .select('id, url')
    .eq('is_active', true)

  if (error || !sites) return { checked: 0, error: error?.message }

  await Promise.all(
    sites.map(async (site) => {
      const status = await pingUrl(site.url)
      await supabase
        .from('wordpress_sites')
        .update({ last_status: status, last_checked_at: new Date().toISOString() })
        .eq('id', site.id)
    }),
  )

  revalidateWp()
  return { checked: sites.length }
}
