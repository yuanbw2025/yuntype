# 开发指南

## 仓库角色

本仓库（`yuanbw2025/yuntype`）是 **开发正本**，所有日常开发、功能迭代、bug 修复都在此仓库进行。

## 架构关系

```
本仓库（开发正本）  ──subtree pull──>  my-website（集成部署库）──> Vercel 部署
```

- **本仓库**：日常开发，接受 PR，独立 git 历史
- **my-website**：集成部署库，通过 `git subtree pull` 拉取本仓库代码，统一构建部署到 Vercel
- **Vercel**：自动部署，线上地址 `https://yuanbw.vercel.app/yuntype/`

## 开发流程

### 日常开发

```bash
cd ~/Desktop/projects/yuntype
git checkout -b feat/xxx
# ... 开发 ...
git add . && git commit -m "feat: xxx"
git push origin feat/xxx
# 在 GitHub 上创建 PR 并合并，或本地 merge 到 main
```

### 同步到主库（部署）

开发完成后，需要到主库执行同步：

```bash
cd ~/Desktop/projects/my-website
bash sync.sh yuntype
git push origin main    # 触发 Vercel 自动部署
```

## 本地目录结构

所有项目统一存放在 `~/Desktop/projects/` 下：

```
~/Desktop/projects/
├── my-website/                    ← 集成部署库（Vercel 入口）
├── storyforge/                    ← 故事熔炉
├── yuntype/                       ← 云中书
├── cyber-flying-sword/            ← 赛博飞剑
├── novel-game/                    ← 小说交互游戏
├── ai-slides/                     ← AI 演示文稿
├── ai-presentation/               ← AI 演示稿
├── Infinite_SpatioTemporal_Map/   ← 无限时空图
├── flying-sword-pinball/          ← 飞剑弹珠
├── wechat-html-injector/          ← 微信 HTML 注入器
└── freellmapizh/                  ← 免费 LLM API 中文文档
```

## 重要规则

| 规则 | 说明 |
|------|------|
| ✅ 在本仓库开发 | 所有功能和修复都在这里提交 |
| ✅ 可接受外部 PR | 合并后同步到主库即可 |
| ❌ 不要在 my-website 里直接改本项目代码 | 会导致 subtree pull 冲突 |

> **架构变更记录**：2026-05-26 之前采用"主库开发 → 镜像推送"模式。现已改为"独立仓库开发 → 主库集成"模式。
