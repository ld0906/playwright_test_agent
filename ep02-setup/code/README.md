# 第 2 集配套文件

> 这个目录里的文件是给学员"开箱即拿"的参考。

## 文件清单

### `.mcp.json`

Playwright MCP server 的标准配置，放到你的项目根目录即可。

复制到项目根：

```bash
cp ep02-setup/code/.mcp.json ./
```

Cursor 用户复制到 `~/.cursor/mcp.json`。

---

## 演示用对话片段

第 4 步在 Claude Code 里的演示对话，建议你照敲一遍：

**第 1 句**：

```
/mcp
```

期望看到：

```
playwright  ✅ connected
```

**第 2 句**：

```
用浏览器打开 http://localhost:5173 并截图给我
```

期望：Claude 调用 `browser_navigate` 和 `browser_screenshot`，返回登录页截图。

**第 3 句**（验证交互能力）：

```
用 alice / password 登录，截一张登录后的图
```

期望：Claude 点击表单、填写、提交，返回书籍列表页截图。这一步通过说明环境完全 OK。
