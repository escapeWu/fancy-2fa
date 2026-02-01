'use server';

import { revalidatePath } from 'next/cache';
import { AccountRepository, TagRepository } from './db/supabase-repository';
import { Account, Tag } from './db/interfaces';

export async function getAccounts() {
  return await AccountRepository.findAll();
}

export async function createAccount(issuer: string, accountName: string, secret: string, tags: Tag[] = []) {
  const newAccount = await AccountRepository.create({
    issuer,
    account: accountName,
    secret,
    tags,
  });
  revalidatePath('/dashboard');
  return newAccount;
}

export async function bulkCreateAccounts(accountsData: {issuer: string, account: string, secret: string}[]) {
  // Use a transaction if possible, or just sequential inserts.
  // Since repository methods are asynchronous, we await them.

  let count = 0;
  for (const acc of accountsData) {
    try {
        await AccountRepository.create({
            issuer: acc.issuer,
            account: acc.account,
            secret: acc.secret,
            tags: []
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

export async function updateAccount(id: number, issuer: string, accountName: string, secret: string, tags: Tag[] = []) {
  const success = await AccountRepository.update(id, {
    issuer,
    account: accountName,
    secret,
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
