# 小杰外卖（前后端整合版）

本项目在原有 GoFrame 后端基础上，加入 React + Vite 前端（小杰外卖）。目录 `gf/webapp` 为前端，`gf` 根目录为后端。

## 后端启动

1) 准备依赖：MySQL、Redis，并修改 [manifest/config/config.yaml](manifest/config/config.yaml) 中连接信息。
2) 导入 SQL：执行 [manifest/sql/create.sql](manifest/sql/create.sql)。
3) 启动：
```bash
go run main.go
```
默认监听 8000 端口，路由与 OpenAPI 见 swagger。

## 前端启动（本地 mock 数据版）

前端目前默认使用浏览器 localStorage 模拟数据，便于快速演示。

```bash
cd gf/webapp
npm install
npm run dev
```

访问地址：http://localhost:3000/#/login

测试账号：
- 用户：test / 123456
- 商家：boss / 123456

Gemini AI 估价：可选，需在 `.env.local` 中设置 `VITE_GEMINI_API_KEY`。

## 后续对接 gf 后端的指引

当前前端的服务层位于 [webapp/services/mockApi.ts](webapp/services/mockApi.ts)，使用 localStorage mock。若要与 GoFrame 后端联通，可按以下思路改造：

1) 鉴权：替换 `loginUser/registerUser/getCurrentUser` 等方法，调用后端 `/auth/login`、`/auth/register` 或 `/user/sign-in`，并保存后端返回的 token（或 session）。
2) 店铺/菜品：将 `getShops/saveMyShop/getMyShop` 对接后端的菜品、店铺接口（当前后端已有 `dish`、`orders` 表，可扩展 shop 结构）。
3) 订单：将 `createOrder/getOrders/updateOrderStatus` 对接 `/orders` 相关接口，并在请求头附带 token。
4) 统一请求封装：建议添加 `services/http.ts`（axios/fetch），在请求拦截器里写入 token。

在逐步替换 mock 时，可保留原有方法签名，内部改为调用真实 API，避免前端组件改动过大。

## 目录结构（关键部分）

- `gf/`：GoFrame 后端
  - `internal/controller`：业务控制器（订单、菜品、员工、认证等）
  - `manifest/`：配置与 SQL
- `gf/webapp/`：React 前端（HashRouter）
  - `pages/`：Auth、UserDashboard、MerchantDashboard
  - `services/`：`mockApi.ts`（可替换为真实接口）、`geminiService.ts`
  - `types.ts`：前端类型定义

## 运行顺序建议

1) 启动后端：`go run main.go`（确保数据库/Redis 配置正确）。
2) 启动前端：`npm run dev` 于 `gf/webapp`。

## 备注

- 前端目前未接后端鉴权，默认本地存储；上线前需接入后端 JWT/gtoken 或会话接口。
- 若使用 Gemini，需准备 API Key。
