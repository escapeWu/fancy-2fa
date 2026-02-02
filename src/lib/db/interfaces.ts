export interface User {
  id?: number;
  name: string;
  email?: string;
  client?: string;
  created_at?: string;
}

export interface Tag {
  id?: number;
  name: string;
  color: string;
}

export interface ShareLink {
  id?: number;
  short_link: string;
  account_id: number;
  created_at?: string;
}

export interface Account {
  id?: number;
  issuer: string;
  account: string;
  secret: string;
  remark?: string;
  period?: number; // TOTP period in seconds, defaults to 30
  created_at?: string;
  tags?: Tag[]; // 这是一个聚合字段，读取时自动填充
  share_link?: string; // 分享短链，读取时自动填充
}

// 基础 Repository 接口
export interface Repository<T> {
  create(item: T): Promise<T>;
  findById(id: number): Promise<T | undefined>;
  findAll(): Promise<T[]>;
  update(id: number, item: Partial<T>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}

// 特定接口定义，方便扩展
export interface IAccountRepository extends Repository<Account> {
  addTagToAccount(accountId: number, tagId: number): Promise<boolean>;
  removeTagFromAccount(accountId: number, tagId: number): Promise<boolean>;
  findByIssuerAndAccount(issuer: string, account?: string): Promise<Account | undefined>;
}

export interface ITagRepository extends Repository<Tag> {
  findByName(name: string): Promise<Tag | undefined>;
}

export interface IShareLinkRepository {
  create(shortLink: string, accountId: number): Promise<ShareLink>;
  findByAccountId(accountId: number): Promise<ShareLink | undefined>;
  findByShortLink(shortLink: string): Promise<ShareLink | undefined>;
  deleteByAccountId(accountId: number): Promise<boolean>;
}

export interface IUserRepository extends Repository<User> {
  findByName(name: string): Promise<User | undefined>;
}
