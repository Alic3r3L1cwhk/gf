# 前端（gf/webapp）

基于 React + Vite 的“小杰外卖”前端，整合到 gf 项目中，可独立运行。

## 开发

```bash
cd gf/webapp
npm install
npm run dev
```

默认端口：3000。

## 构建

```bash
npm run build
```

## 环境变量

- `VITE_GEMINI_API_KEY`：可选，用于 Gemini AI 估价/摘要功能。

## 功能概览
- 登录/注册/重置密码（本地存储模拟，测试账号：test/123456，商家：boss/123456）。
- 用户：选店铺、点菜单、AI 文本分析、创建订单并查看状态。
- 商家：查看并更新订单状态，编辑店铺和菜品信息。

> 当前服务层默认使用浏览器 localStorage mock 数据，后续可按需改造对接 gf 后端 API。
