# ppmenu_assets - 测试数据

## 📊 数据说明

这是ppmenu_assets仓库的测试数据分支，包含30条测试商品数据。

### 数据概况
- **总页数**: 3
- **每页数量**: 10
- **总商品数**: 30
- **生成时间**: 2026/4/11 09:38:36

### 数据来源
从生产数据（main分支）的以下页面随机采样：
- 第1页
- 第3页
- 第5页
- 第10页
- 第15页
- 第20页
- 第25页

---

## 📁 文件说明

### db/ 目录
- `data-page1.json` - 第1页数据（10条）
- `data-page2.json` - 第2页数据（10条）
- `data-page3.json` - 第3页数据（10条）

### 筛选配置
- `filter-dimensions.json` - 四维筛选配置（已更新数量）
- `filter-categories.json` - 商品类型筛选配置

---

## 🚀 使用方法

### 在小程序项目中使用测试数据

修改 `src/utils/config.js`：
``javascript
export const CURRENT_ENV = ENVIRONMENT.DEVELOPMENT
```

### CDN地址
```
https://cdn.jsdelivr.net/gh/tKyle-Libra/ppmenu_assets@test/
```

---

## ⚠️ 注意事项

1. 这是测试数据，仅用于开发调试
2. 不要将test分支合并到main分支
3. 更新测试数据时，请重新运行生成脚本

---

**最后更新**: 2026/4/11
