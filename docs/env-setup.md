# 环境变量配置说明
# ========================

# 本地开发环境
DATABASE_URL=file:dev.db
JWT_SECRET=dev-secret-local

# 生产环境 (Cloudflare Workers)
# 在 Cloudflare Dashboard 中设置以下环境变量：
# DATABASE_URL=libsql://<account-id>.cloudflare.com/blog-template-db
# DATABASE_AUTH_TOKEN=<你的 Cloudflare API Token>
# JWT_SECRET=<使用 openssl rand -hex 32 生成的安全密钥>
