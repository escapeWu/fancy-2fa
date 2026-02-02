import { supabaseAdmin } from '../supabase';
import { Account, IAccountRepository, ITagRepository, IUserRepository, IShareLinkRepository, Repository, Tag, User, ShareLink } from './interfaces';

// --- User Repository ---
export class SupabaseUserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async findById(id: number): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return data;
  }

  async findByName(name: string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('name', name)
      .single();

    if (error || !data) return undefined;
    return data;
  }

  async findAll(): Promise<User[]> {
    const { data, error } = await supabaseAdmin.from('users').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  }

  async update(id: number, user: Partial<User>): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('users')
      .update(user)
      .eq('id', id);
    return !error;
  }

  async delete(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);
    return !error;
  }
}

// --- Tag Repository ---
export class SupabaseTagRepository implements ITagRepository {
  async create(tag: Tag): Promise<Tag> {
    const { data, error } = await supabaseAdmin
      .from('tags')
      .insert(tag)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async findById(id: number): Promise<Tag | undefined> {
    const { data, error } = await supabaseAdmin
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return undefined;
    return data;
  }

  async findByName(name: string): Promise<Tag | undefined> {
    const { data, error } = await supabaseAdmin
      .from('tags')
      .select('*')
      .eq('name', name)
      .single();
    if (error) return undefined;
    return data;
  }

  async findAll(): Promise<Tag[]> {
    const { data, error } = await supabaseAdmin.from('tags').select('*');
    if (error) throw new Error(error.message);
    return data || [];
  }

  async update(id: number, tag: Partial<Tag>): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('tags')
      .update(tag)
      .eq('id', id);
    return !error;
  }

  async delete(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('tags')
      .delete()
      .eq('id', id);
    return !error;
  }
}

// --- Account Repository ---
export class SupabaseAccountRepository implements IAccountRepository {
  async create(account: Account): Promise<Account> {
    // 1. Insert Account
    const { data: newAccount, error } = await supabaseAdmin
      .from('accounts')
      .insert({
        issuer: account.issuer,
        account: account.account,
        secret: account.secret,
        remark: account.remark || ''
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // 2. Insert Tags if any
    if (account.tags && account.tags.length > 0) {
      const tagRelations = account.tags.map(tag => ({
        account_id: newAccount.id,
        tag_id: tag.id
      }));

      const { error: tagError } = await supabaseAdmin
        .from('account_tags')
        .insert(tagRelations);

      if (tagError) console.error('Error inserting tags:', tagError);
    }

    // Return full object
    return { ...newAccount, tags: account.tags || [] };
  }

  async findById(id: number): Promise<Account | undefined> {
    const { data, error } = await supabaseAdmin
      .from('accounts')
      .select(`
        *,
        tags (*),
        share_links (short_link)
      `)
      .eq('id', id)
      .single();

    if (error) return undefined;
    // Flatten share_link from the join result
    const shareLink = data.share_links?.[0]?.short_link || data.share_links?.short_link;
    return { ...data, share_link: shareLink, share_links: undefined };
  }

  async findAll(): Promise<Account[]> {
    const { data, error } = await supabaseAdmin
      .from('accounts')
      .select(`
        *,
        tags (*),
        share_links (short_link)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    // Flatten share_link from the join result for each account
    return (data || []).map((acc: any) => {
      const shareLink = acc.share_links?.[0]?.short_link || acc.share_links?.short_link;
      return { ...acc, share_link: shareLink, share_links: undefined };
    });
  }

  async update(id: number, account: Partial<Account>): Promise<boolean> {
    // 1. Update basic fields
    const { issuer, account: accName, secret, remark, tags } = account;
    const updates: any = {};
    if (issuer) updates.issuer = issuer;
    if (accName) updates.account = accName;
    if (secret) updates.secret = secret;
    if (remark !== undefined) updates.remark = remark;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabaseAdmin
        .from('accounts')
        .update(updates)
        .eq('id', id);
      if (error) return false;
    }

    // 2. Update Tags if provided (replace all)
    if (tags !== undefined) {
      // Delete existing
      await supabaseAdmin.from('account_tags').delete().eq('account_id', id);

      // Add new
      if (tags.length > 0) {
        const tagRelations = tags.map(tag => ({
          account_id: id,
          tag_id: tag.id
        }));
        await supabaseAdmin.from('account_tags').insert(tagRelations);
      }
    }

    return true;
  }

  async delete(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('accounts')
      .delete()
      .eq('id', id);
    return !error;
  }

  async addTagToAccount(accountId: number, tagId: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('account_tags')
      .insert({ account_id: accountId, tag_id: tagId });
    return !error;
  }

  async removeTagFromAccount(accountId: number, tagId: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('account_tags')
      .delete()
      .match({ account_id: accountId, tag_id: tagId });
    return !error;
  }

  async findByIssuerAndAccount(issuer: string, account?: string): Promise<Account | undefined> {
    let query = supabaseAdmin
      .from('accounts')
      .select(`
        *,
        tags (*)
      `)
      .eq('issuer', issuer);

    if (account) {
      query = query.eq('account', account);
    }

    const { data, error } = await query.maybeSingle(); // Use maybeSingle to avoid error on 0 rows

    if (error || !data) return undefined;
    return data;
  }
}

// --- ShareLink Repository ---
export class SupabaseShareLinkRepository implements IShareLinkRepository {
  async create(shortLink: string, accountId: number): Promise<ShareLink> {
    const { data, error } = await supabaseAdmin
      .from('share_links')
      .insert({ short_link: shortLink, account_id: accountId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async findByAccountId(accountId: number): Promise<ShareLink | undefined> {
    const { data, error } = await supabaseAdmin
      .from('share_links')
      .select('*')
      .eq('account_id', accountId)
      .single();
    if (error) return undefined;
    return data;
  }

  async findByShortLink(shortLink: string): Promise<ShareLink | undefined> {
    const { data, error } = await supabaseAdmin
      .from('share_links')
      .select('*')
      .eq('short_link', shortLink)
      .single();
    if (error) return undefined;
    return data;
  }

  async deleteByAccountId(accountId: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('share_links')
      .delete()
      .eq('account_id', accountId);
    return !error;
  }
}

// Export singleton instances
export const UserRepository = new SupabaseUserRepository();
export const AccountRepository = new SupabaseAccountRepository();
export const TagRepository = new SupabaseTagRepository();
export const ShareLinkRepository = new SupabaseShareLinkRepository();
