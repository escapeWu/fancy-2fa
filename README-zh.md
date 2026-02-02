# Fancy 2FA (Guardian Gate)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FescapeWu%2Ffancy-2fa&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,AUTH_SECRET_KEY,API_AUTH_TOKEN)

[English](./README.md) | 简体中文

一个安全、注重隐私的双因素认证 (2FA) 管理面板

## 功能特性

- 📱 **API 访问**: 通过安全的 API 端点以编程方式生成 TOTP 验证码。
- 🔗 **分享链接**: 为单个 2FA 验证码生成可分享的链接，允许临时访问而不暴露密钥。
- 📋 **快速复制**: 单击即可快速复制验证码、账户名或备注。
- 📥 **CSV 导入/导出**: 通过 CSV 文件批量导入和导出账户，包括备注和标签。

<img width="394" height="619" src="https://github.com/user-attachments/assets/7db0971d-8688-430a-9b87-817d2dc1574b" />
<img width="394" height="619" src="https://github.com/user-attachments/assets/342a70fa-e7f8-4d40-be6d-6dc08bf26f88" />

## 快速开始

### 1. 环境配置

将示例环境文件复制为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 并配置以下变量：

| 变量 | 说明 |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | 您的 Supabase 项目 URL（例如：`https://xyz.supabase.co`）。 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 您的 Supabase 项目的 `anon`（公开）密钥。 |
| `SUPABASE_SERVICE_ROLE_KEY` | （可选）您的 Supabase `service_role` 密钥。用于绕过 RLS 的管理员/服务端操作。 |
| `AUTH_SECRET_KEY` | **必填。** 用于登录 Web 面板的密码。请选择一个强密码。 |
| `API_AUTH_TOKEN` | **必填。** 用于验证 `/api/totp` 端点请求的令牌。 |

### 2. 数据库设置 (Supabase)

1.  进入您的 Supabase 项目的 **SQL 编辑器**。
2.  打开本项目根目录下的 `supabase_schema.sql` 文件。
3.  复制内容并在 Supabase SQL 编辑器中运行。

## API生成 验证码
您可以通过 API 以编程方式生成 TOTP 验证码。

**端点：** `GET /api/totp`

**请求头：**
- `Authorization`: `Bearer <API_AUTH_TOKEN>`

**查询参数：**
- `issuer`（必填）：服务名称（例如："Google"、"GitHub"）。
- `account`（可选）：账户名/邮箱（例如："user@example.com"）。

**请求示例：**
```bash
curl -H "Authorization: Bearer your-api-token" \
     "http://localhost:3000/api/totp?issuer=Google&account=user@example.com"
```

## 许可证

[MIT](LICENSE)
