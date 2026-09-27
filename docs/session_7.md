远端有新提交 `2202c52 "update session log"`。拉取并查看新内容。
`docs/session_5.md` 包含被中断的 session-3 日志（我上一轮已将其完成并推送为 session 4 / commit 4d4d622）。用户还修改了 `worklog.md`。查看变更内容与当前工作区状态。
工作区已刷新至 `2202c52`。session_5.md 是被中断 session-3 的日志（其工作我已作为 session 4 完成并推送）。本会话（session 5）任务：全新一致性审计 + 迭代。建立待办清单。
基线门禁全绿。启动 dev server 并验证健康状态。
Dev server 健康且使用正确的 DATABASE_URL。现在加载 agent-browser 技能开始目标站审计。
目标站会话已恢复。验证登录状态并开始移动端导航审计。
目标站已登录。设置移动端视口，开始移动端导航菜单审计。
菜单已打开（X 图标出现）。定位菜单容器的实际结构。
菜单结构符合已知规格。测试路由切换自动关闭行为。
目标移动端菜单行为全部正常。现在对克隆站执行相同验证。
克隆菜单已打开（X 图标）但选择器未命中。检查克隆菜单容器的实际 class。
Class 顺序不同但渲染等价（Tailwind 不受属性顺序影响）。测试克隆菜单的路由关闭行为。
克隆移动端菜单全部通过（开/关/路由联动/激活态）。无 Tailwind v4 bug。现在检测目标站数据漂移。
目标目录与 session 2 时一致（5 商品 + 已知 XSS 垃圾行，刻意不入种子）。检查目标会员方案与价格。
目标 rail 顺序：Starter → Basic Fit → Pro Athlete → Family Pack。检查克隆的当前顺序。
Rail 顺序与价格完全一致。现在进行系统性视觉对比 — 截取双方各页面截图。
循环输出异常，改为逐页捕获。
全部页面截图完成。加载 VLM 技能进行系统化视觉对比。
Home MATCH。继续对比其余页面。
相对路径截图保存到了 daemon 的 CWD。检查并用绝对路径重新捕获。
桌面端 5 页全部 MATCH。现在移动端验证（home + 菜单打开态）。
VLM 报告克隆移动端缺少定价卡 — 疑为 framer-motion whileInView 捕获伪影。DOM 验证。
DOM 确认所有区块渲染正常（3 张定价卡，opacity 1）。这是全页截图的动画伪影。注入 CSS 强制终结动画状态后重拍双方。
依然缺失 — 可能是滚动回顶部后 framer-motion 的退出动画（非 once 模式）将卡片重置。直接检查卡片级 opacity。
**发现真实缺陷候选**：克隆的定价卡在滚出视口后动画退出（opacity 0），而目标保持可见。这可能是 framer-motion `whileInView` 的 `once` 配置差异。检查代码。
代码已用 `once: true`。问题在于**跳滚**（瞬间跳到底部再回顶部）从未让中间区块与视口相交，observer 不触发。改用步进滚动让所有区块真正进入视口。
同步 for 循环仍等效于跳滚（无重绘）。用异步延时步进。
步进滚动后卡片全部 opacity 1 — 确认之前是纯捕获伪影。用此方法重拍双方移动端。
动画正确触发后出现**3 个真实差异候选**：① hero 图片上的 "N" 徽章 ② Pro Athlete 特性列表 ③ 首页商品预览顺序。逐一 DOM 验证。
DOM 无 "N" 徽章元素。对比双方 hero 图 URL 并裁剪对比该区域。
Hero 匹配（"N" 为 VLM 误读）。现在验证 Pro Athlete 特性列表差异。
**S5-R1 确认**：目标 Pro Athlete 第 4 项是 "Premium equipment access"（5 项），克隆是 "Recovery room access" + 多出第 6 项。检查目标 rail 上所有方案的特性与 Basic Fit。
**关键发现**：目标自身的 Home 预览卡与 Memberships rail 卡的 Pro Athlete 特性不同 — Home 卡是硬编码（含 "Premium equipment access"，5 项），rail 卡来自实体（6 项，与克隆种子一致）。目标内部自身漂移。精确提取 Home 卡确认。
目标 Home 预览的 Pro Athlete 卡为硬编码 5 项。继续审计 — 对比 Home 店铺预览的商品列表。
目标店铺预览包含 XSS 垃圾行（最新创建）。需确认其查询语义 — 通过网络请求或实体 API 检查。
**目标查询确认**：Home 店铺预览 = `featured:true & sort=-created_date & limit=4`（最新优先）。检查克隆当前查询。
克隆查询已是 `featured:true + createdAt desc + take 4`（与目标一致）— 但种子商品 createdAt 存在毫秒并列（与 session-3 会员方案相同的问题），导致顺序翻转。**S5-R2 确认**。继续审计 Shop 页查询语义。
网络日志与 DOM 顺序存在矛盾 — 直接查询目标实体 API 获取真实数据（created_date + featured）。
**关键数据**：目标 4 个原始商品共享同一时间戳（毫秒并列）— 目标自身的排序在并列时任意。检查克隆 Shop 页的查询与顺序。
克隆 Shop 网格顺序与目标 DOM 顺序不一致 — 需确认目标客户端默认排序逻辑。检查目标的排序下拉框。
**目标 Shop 默认排序 = Name (A-Z)**（解释了 DOM 顺序）。克隆渲染同样按字母序 — 验证克隆排序控件默认值。
排序默认值一致。展开下拉框对比完整选项集。
排序与分类选项完全一致。快速验证交叉销售对话框与 toast 行为。
对话框仅在非重复添加时打开 — Pro Athlete 已在购物车（去重逻辑正确）。换一个方案测试。
交叉销售对话框正常。但发现 **S5-R3 候选**：目标 cross-sell 查询 = `featured+(-created_date)+limit=3`，克隆用插入序。检查目标 bundle 中 Pro 特性是否硬编码。
Bundle 证实：目标首页预览卡是**硬编码**的。提取完整硬编码数组。
**核心发现**：目标首页预览算法 = 取最新 3 个方案，但**中卡强制替换为硬编码 Pro Athlete**（5 特性 + `color_scheme:"blue"`，而实体是 green）。验证目标的颜色渲染。
目标 Home Pro 卡 = `border-blue-500/50`（硬编码的 blue 配色）+ Star 徽章。检查克隆 Home Pro 卡的边框颜色。
克隆 Home Pro 卡已是 blue 边框 + Star 徽章 — 唯一差异是**特性列表（6 vs 硬编码 5）**。查看 membership-card 的实现。
克隆 Home 卡视觉已对等（popular→blue+Star）。核心缺陷是特性列表数据源。检查 `/api/products` 的排序处理（cross-sell 语义）。
API 已有 `createdAt desc` ✓ — 核心是种子时间戳并列。审计完成，检查种子商品数组顺序后编制整改计划。
目标 bundle 算法显示 `s=[e[0], n, e[1]]` — 需确认目标 Membership 实体的实际返回顺序（并列时间戳的 tie-break）。
**完整图景确认**：目标 e=[Family, Starter, Pro(最旧)]，中卡被硬编码 Pro 替换（第 3 个实体被丢弃）。获取 Basic Fit 日期补全种子修正。
审计完成 — 3 个根缺陷确认。现在按 TDD 执行：先看现有 e2e 锁定，写 RED 规格。
现在编写 RED 规格。先查看 MembershipDTO 类型定义。
单元测试通过。现在更新 e2e 规格（RED）— 硬编码中卡断言 + 店铺预览顺序 + cross-sell 顺序。
RED 规格就绪。现在实现 GREEN。先查看种子商品块与 plans-preview 现状。
实现 GREEN。先检查种子的幂等逻辑（确保重新播种会更新 createdAt）。
种子是先清空再插入 — 幂等。现在实施种子修改：交换 Starter/Pro 顺序 + 固定日期对齐目标真实数据。
种子更新完成。现在更新 plans-preview 使用硬编码中卡算法。
更新 home-page.tsx 的查询注释以反映新算法。
重新播种 dev DB（固定日期），然后跑快速门禁。
定位器匹配到外层容器（13 个 li = 5+5+3，实现实际正确）。修正定位器为卡片级。
定向 specs 全绿。跑完整 e2e 套件查回归。
**全套件 58/58 全绿**（+1 新规格）。现在视觉验证修复后的页面。
**精确对等达成**。验证 cross-sell 对话框产品顺序。
Cross-sell 对齐。现在填充演示购物车并重拍全部截图。
13 张截图完成。最终 VLM 验证修复后的 home 页面对比。
**最终 VLM: MATCH**。开始文档更新。
现在更新 SKILL.md：
文档更新完成。撰写会话完成日志。
✅ **Session 5 完成 — 已推送至 main @ 76c2d8e**（远程 ref 已验证，密钥已销毁，工作区干净）。

**本轮亮点：**
- **移动端导航**端到端复验通过（开/关/aria/路由联动）— 无 Tailwind v4 问题
- 深挖目标**实体 API + 网络 log + JS bundle**，发现 3 个新根缺陷：目标首页预览的**中卡是硬编码 Pro Athlete**（5 项特性含 "Premium equipment access"，非实体数据）；商品时间戳并列导致排序漂移；方案种子日期与目标真实数据不符
- TDD 修复：新增 `home-featured-plan` 纯接缝（7 单元测试）+ 强化 e2e；种子改用目标**真实日期**（重播种完全确定性）
- 全门禁绿：lint ✓ typecheck ✓ **47/47 单元** ✓ build ✓ **58/58 e2e** ✓；VLM 全页 MATCH；13 张截图重拍

**建议下一步：** 打开预览走黄金路径（首页 → 选方案 → cross-sell → 结账）目视验收；如发现细微差异，指出具体界面即可继续迭代。
