# Cloudflare Workers 部署说明

## 部署步骤

### 1. 创建 KV Namespace

```bash
# 登录 Cloudflare
wrangler login

# 创建 KV namespace
wrangler kv:namespace create "QTFM_KV"
```

创建成功后会显示 namespace ID，将其复制到 `wrangler.toml` 中的 `id` 字段。

### 2. 部署 Worker

```bash
# 部署到 Cloudflare
wrangler deploy
```

### 3. 测试

部署成功后，访问 Worker URL 即可获取电台数据：

```bash
curl https://your-worker.your-subdomain.workers.dev
```

## 工作原理

1. **缓存机制**：使用 KV 存储数据，key 为时间戳
2. **自动刷新**：当数据超过 1 小时，异步获取新数据并更新 KV
3. **清理机制**：自动删除旧的 KV 条目，只保留最新的数据
4. **响应头**：
   - `X-Cache-Status: miss` - 无缓存，新获取的数据
   - `X-Cache-Status: stale` - 返回旧数据，后台正在刷新

## 本地开发

```bash
# 本地运行
wrangler dev

# 访问本地测试
curl http://localhost:8787
```

## 配置说明

- `CACHE_DURATION`: 缓存有效期（默认 3600 秒 = 1 小时）
- `KV_KEY_PREFIX`: KV key 前缀
- CORS 已启用，允许跨域访问
