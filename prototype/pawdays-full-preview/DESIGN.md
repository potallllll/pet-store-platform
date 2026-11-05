---
version: alpha
colors:
  primary: "#8A431B"
  canvas: "#F7F3ED"
  surface: "#FFFFFF"
  subtle: "#F1E9DE"
  textPrimary: "#302820"
  textSecondary: "#6D5B4D"
  brandFill: "#F2BE8D"
  brandInk: "#5C341A"
  brandStrong: "#8A431B"
  brandTint: "#F9E4D1"
  controlBorder: "#927961"
  danger: "#9A3726"
  success: "#355E42"
typography:
  ui:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif'
  data:
    fontFamily: 'ui-monospace, "SFMono-Regular", Consolas, monospace'
rounded:
  control: "12px"
  card: "16px"
  hero: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button:
    height: "44px"
    backgroundColor: "{colors.brandFill}"
    textColor: "{colors.brandInk}"
  card:
    rounded: "{rounded.card}"
    backgroundColor: "{colors.surface}"
  focus:
    textColor: "{colors.brandStrong}"
---

## Overview

PawDays 是面向社区宠物门店的双端业务原型。客户端像一份温暖、可靠的照护手账；店员端像放在前台随手可用的当日工作夹。两者共享奶油白、杏橙和深棕灰，但店员端通过更紧凑的清单、状态条与批次信息表达效率。

记忆点是“照护丝带”：正在进行的业务用一条连续的暖色进度带贯穿宠物、服务状态和下一步动作。它只出现在关键流程，不作为无意义装饰。

避免医疗化绿色、紫蓝霓虹 AI 风、大面积促销红、后台模板式四宫格统计首页，以及用 Emoji 充当正式图标。

## Colors

颜色值镜像仓库 `docs/10a-customer-ui-design-system.md`。本原型以 `dist/styles.css` 中同名 CSS 变量为运行时唯一来源，DESIGN.md 记录意图与映射。小面积蓝绿只表达信息与完成状态，不构成品牌基底。

## Typography

使用稳定的系统中文无衬线栈，避免首屏字体替换。页面标题 20/28、区块标题 16/24、正文 16/24、辅助正文 14/20、标签 12/18。数字金额使用等宽数字特性，不另下载展示字体。

## Layout

主视图采用移动端优先的单列 H5。桌面宽度下显示 430px 设备画布和一列原型控制台；窄屏控制台折叠为顶部切换条。客户端底栏三项，店员端底栏五项，页面自然纵向滚动。

## Elevation & Depth

白色卡片使用轻边框和极浅阴影；弹层和底部抽屉才使用明显层级。信息密度通过分组、分隔和状态文本建立，不靠厚重阴影堆叠。

## Shapes

普通卡片 16px、英雄区域 20px、控件 12px、状态标签胶囊形。头像和顾问入口可用圆形，其余按钮不滥用胶囊。

## Components

按钮最小热区 44px。主操作使用杏橙底配深棕字，危险操作使用深红但与安全主操作分开。所有列表卡、搜索、筛选、弹层、Toast 和底栏均由共享 CSS/JS 模式生成。

## Do's and Don'ts

- 保留真实业务动词，如“确认预约”“确认免单”“已阅读，继续”。
- 待决能力标注“方案预览”或“暂未开放”，不伪装为已确认实现。
- Mock 广告、AI 和支付过程必须明确标注“原型模拟”。
- 不把通知已读、待办已处理、服务完成、已收款、已离店互相替代。
