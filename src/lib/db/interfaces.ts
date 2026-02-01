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

export interface Account {
  id?: number;
  issuer: string;
  account: string;
  secret: string;
  period?: number; // TOTP period in seconds, defaults to 30
  created_at?: string;
  tags?: Tag[]; // 这是一个聚合字段，读取时自动填充
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

export interface IUserRepository extends Repository<User> {
  findByName(name: string): Promise<User | undefined>;
}
