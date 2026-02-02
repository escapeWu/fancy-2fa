'use server';

import { revalidatePath } from 'next/cache';
import { AccountRepository, TagRepository, ShareLinkRepository } from './db/supabase-repository';
import { Account, Tag, ShareLink } from './db/interfaces';

export async function getAccounts() {
  return await AccountRepository.findAll();
}

export async function createAccount(issuer: string, accountName: string, secret: string, tags: Tag[] = [], remark: string = '') {
  const newAccount = await AccountRepository.create({
    issuer,
    account: accountName,
    secret,
    remark,
    tags,
  });
  revalidatePath('/dashboard');
  return newAccount;
}

export async function bulkCreateAccounts(accountsData: {issuer: string, account: string, secret: string, remark?: string, tags?: Tag[]}[]) {
  // Use a transaction if possible, or just sequential inserts.
  // Since repository methods are asynchronous, we await them.

  let count = 0;
  for (const acc of accountsData) {
    try {
        await AccountRepository.create({
            issuer: acc.issuer,
            account: acc.account,
            secret: acc.secret,
            remark: acc.remark || '',
            tags: acc.tags || []
        });
        count++;
    } catch (e) {
        console.error(`Failed to import account ${acc.issuer}:${acc.account}`, e);
    }
  }
  revalidatePath('/dashboard');
  return count;
}

export async function deleteAccount(id: number) {
  const success = await AccountRepository.delete(id);
  revalidatePath('/dashboard');
  return success;
}

export async function updateAccount(id: number, issuer: string, accountName: string, secret: string, tags: Tag[] = [], remark: string = '') {
  const success = await AccountRepository.update(id, {
    issuer,
    account: accountName,
    secret,
    remark,
    tags,
  });
  revalidatePath('/dashboard');
  return success;
}

// --- Tag Actions ---

export async function getTags() {
  return await TagRepository.findAll();
}

export async function createTag(name: string, color: string) {
  const newTag = await TagRepository.create({
    name,
    color,
  });
  revalidatePath('/dashboard');
  return newTag;
}

export async function deleteTag(id: number) {
  const success = await TagRepository.delete(id);
  revalidatePath('/dashboard');
  return success;
}

export async function findOrCreateTagByName(name: string): Promise<Tag> {
  const existing = await TagRepository.findByName(name);
  if (existing) {
    return existing;
  }
  // Create new tag with a default color
  const defaultColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
  const color = defaultColors[Math.floor(Math.random() * defaultColors.length)];
  return await TagRepository.create({ name, color });
}

// --- ShareLink Actions ---

function generateShortLink(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createShareLink(accountId: number): Promise<ShareLink> {
  // Check if already exists
  const existing = await ShareLinkRepository.findByAccountId(accountId);
  if (existing) {
    return existing;
  }

  // Generate unique short link
  let shortLink = generateShortLink();
  let attempts = 0;
  while (await ShareLinkRepository.findByShortLink(shortLink)) {
    shortLink = generateShortLink();
    attempts++;
    if (attempts > 10) {
      throw new Error('Failed to generate unique short link');
    }
  }

  const newShareLink = await ShareLinkRepository.create(shortLink, accountId);
  revalidatePath('/dashboard');
  return newShareLink;
}

export async function deleteShareLink(accountId: number): Promise<boolean> {
  const success = await ShareLinkRepository.deleteByAccountId(accountId);
  revalidatePath('/dashboard');
  return success;
}

export async function getAccountByShortLink(shortLink: string): Promise<Account | undefined> {
  const shareLinkRecord = await ShareLinkRepository.findByShortLink(shortLink);
  if (!shareLinkRecord) {
    return undefined;
  }
  return await AccountRepository.findById(shareLinkRecord.account_id);
}
