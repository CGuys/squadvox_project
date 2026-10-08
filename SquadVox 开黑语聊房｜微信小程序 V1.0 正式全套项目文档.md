# SquadVox 开黑语聊房｜微信小程序 V1\.0 正式全套项目文档

## 一、项目品牌定型（正式固化）

**项目英文名称**：SquadVox

**项目中文名称**：SquadVox 开黑语聊房

**名称释义**：Squad（电竞小队/开黑车队）\+ Vox（实时语音声讯），专为游戏组队打造的低延迟语音房间工具

**官方Slogan**：极速开黑语音，随时随地集结车队

**技术栈**：Uni\-app（Vue3）微信小程序 \+ Node\.js 后端 \+ MySQL \+ Redis \+ 腾讯云TRTC

**核心定位**：轻量化王者荣耀开黑语聊工具，无需加好友，快速组建临时车队，低延迟实时语音开黑

**版本策略**：V1\.0 仅落地核心语聊\+个人基础资料，战力查询、英雄数据等功能后置迭代

## 二、V1\.0 版本迭代范围（正式固化）

### ✅ V1\.0 必做功能（上线核心闭环）

- 微信一键授权登录、用户基础信息管理

- 个人中心：王者大区、游戏ID、段位、擅长分路 手动录入/编辑

- 房间创建、房间列表展示、房间条件筛选

- 密码房间、进出房间权限校验

- TRTC 多人实时语音房（核心），支持静音/开麦、后台监听

- 房间成员在线展示、语音声波状态提示、iOS/安卓后台适配提示

- 房主权限：踢人、关闭房间、全员静音

- 房间文字弹幕聊天、内容安全审核

- 一键复制王者组队文案

- 用户举报功能、隐私协议、合规内容审核

### ❌ V1\.0 暂不实现（后置 V1\.1/V1\.2 迭代）

- 个人英雄战力录入、战力标签展示

- 英雄战区上榜门槛查询工具

- 用户私信、车队收藏、开黑预约

- 语音回放、房间排行榜、数据看板

- 礼物打赏、付费功能

## 三、产品PRD正式版（V1\.0）

### 3\.1 产品目标

低成本验证王者玩家临时开黑语聊核心需求，解决传统开黑需加好友、语音延迟高、无法快速组队的痛点，打造轻量化、即用即走的游戏组队语音工具，后续可迭代扩展为全品类游戏语聊平台及独立APP。

### 3\.2 用户角色

- **普通玩家**：授权登录、编辑个人游戏资料、浏览/加入语音房间、语音沟通、发送房间文字、举报违规用户

- **房主**：创建房间、设置房间信息/密码、管理房间成员（踢人）、关闭房间、全员静音管控

### 3\.3 整体功能架构

SquadVox 小程序 V1\.0 仅保留三大核心模块

1. **用户模块**：微信登录、个人游戏资料录入与展示

2. **房间语聊模块（核心）**：房间创建、列表、进出管理、TRTC实时语音、房间文字聊天

3. **安全合规模块**：内容审核、用户举报、隐私协议

### 3\.4 详细功能说明

#### 3\.4\.1 用户模块

**1\. 微信授权登录**

- 进入小程序自动唤起微信授权，获取用户头像、昵称

- 自动生成唯一用户标识，首次登录自动注册账号

- V1\.0 无需手机号，降低用户准入门槛

- 登录成功下发Token，全局状态保持登录

**2\. 个人游戏资料管理**

可编辑字段：游戏大区（微信/QQ区）、游戏服务器、王者游戏ID、当前段位、擅长分路（对抗路/打野/中路/发育路/游走）

页面固定合规提示：所有游戏资料由用户手动录入，本工具不抓取王者荣耀官方数据，与王者荣耀、腾讯官方无关联

#### 3\.4\.2 房间核心模块

**1\. 创建房间**

- 可配置：房间名称、车队类型（2排/3排/5排）、房间标签（上分/娱乐/练英雄）、人数上限、房间密码（可选）

- 创建成功自动进入房间，后端生成唯一房间编号，Redis缓存房间在线状态

**2\. 房间列表**

- 卡片展示：房主头像/昵称/段位、房间名称、车队类型、房间标签、当前人数/最大人数、是否加密

- 支持筛选：按车队排数、房间标签筛选

- 无密码房间一键进入，加密房间弹窗校验密码

**3\. 语音房间核心能力**

- 基于腾讯云TRTC实现多人低延迟实时语音，适配微信小程序场景

- 支持麦克风开关、静音/取消静音，实时声波指示器展示发言状态

- 适配手机后台场景：页面常驻后台保活音频

- 系统适配提示：iOS切游戏后台仅可收听、麦克风失效；安卓建议关闭省电策略保证语音畅通

- 网络波动自动重连语音房间

**4\. 房间管理权限**

- 房主专属：踢出房间成员、关闭房间、全员静音

- 房间无人自动销毁，释放TRTC资源与后端缓存

**5\. 房间辅助功能**

- 房间文字弹幕聊天，所有消息前置内容安全审核，拦截违规内容

- 一键复制开黑组队文案，快速分享邀约队友

#### 3\.4\.3 安全合规模块

- 首次进入小程序展示隐私协议弹窗

- 文字消息接入微信内容安全接口，语音接入TRTC内容审核

- 支持用户举报（辱骂、广告、不良言论），提交举报记录存档

## 四、数据库正式表结构（V1\.0 精简版）

V1\.0 仅创建4张核心表，战力相关表后续迭代新增

```sql
-- SquadVox V1.0 数据库初始化脚本
CREATE DATABASE IF NOT EXISTS squadvox_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE squadvox_db;

-- 用户表
CREATE TABLE `user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户主键ID',
  `wx_openid` VARCHAR(64) NOT NULL COMMENT '微信唯一标识',
  `nickname` VARCHAR(64) DEFAULT '' COMMENT '微信昵称',
  `avatar` VARCHAR(255) DEFAULT '' COMMENT '头像地址',
  `game_area` VARCHAR(16) DEFAULT '' COMMENT '游戏大区：微信区/QQ区',
  `game_server` VARCHAR(32) DEFAULT '' COMMENT '游戏服务器',
  `game_id` VARCHAR(32) DEFAULT '' COMMENT '王者荣耀游戏ID',
  `rank` VARCHAR(32) DEFAULT '' COMMENT '游戏段位',
  `position` VARCHAR(32) DEFAULT '' COMMENT '擅长分路',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SquadVox用户表';

-- 房间表
CREATE TABLE `room` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '房间主键ID',
  `room_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '唯一房间编号',
  `owner_id` INT NOT NULL COMMENT '房主用户ID',
  `room_name` VARCHAR(64) DEFAULT '' COMMENT '房间名称',
  `room_type` VARCHAR(16) DEFAULT '' COMMENT '车队类型：2排/3排/5排',
  `tag` VARCHAR(32) DEFAULT '' COMMENT '房间标签：上分/娱乐/练英雄',
  `max_num` INT DEFAULT 5 COMMENT '最大人数',
  `room_pwd` VARCHAR(32) DEFAULT '' COMMENT '房间密码，空=无密码',
  `status` TINYINT DEFAULT 1 COMMENT '房间状态：0-关闭 1-开放',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SquadVox语音房间表';

-- 房间消息表
CREATE TABLE `room_message` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '消息主键ID',
  `room_no` VARCHAR(32) NOT NULL COMMENT '关联房间编号',
  `user_id` INT NOT NULL COMMENT '发送用户ID',
  `content` VARCHAR(512) DEFAULT '' COMMENT '消息内容',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房间文字消息表';

-- 举报记录表
CREATE TABLE `report` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '举报主键ID',
  `room_no` VARCHAR(32) DEFAULT '' COMMENT '关联房间编号',
  `target_user_id` INT DEFAULT 0 COMMENT '被举报用户ID',
  `report_type` VARCHAR(32) DEFAULT '' COMMENT '举报类型：辱骂/广告/不良言论',
  `desc` VARCHAR(512) DEFAULT '' COMMENT '举报备注描述',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '举报时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户举报记录表';
```

## 五、后端接口清单（V1\.0 正式精简版）

统一接口前缀：`/squadvox/api`，统一请求头：`Authorization: Bearer {token}`

统一返回码：200成功、401未登录、403无权限、400参数错误、500服务异常

|接口地址|请求方式|接口说明|
|---|---|---|
|/squadvox/api/user/login|POST|微信授权登录，返回用户信息\+Token|
|/squadvox/api/user/saveInfo|POST|保存/编辑个人游戏基础资料|
|/squadvox/api/user/getInfo|GET|获取当前登录用户资料|
|/squadvox/api/room/create|POST|创建语音开黑房间|
|/squadvox/api/room/list|GET|获取房间列表（支持筛选）|
|/squadvox/api/room/enter|POST|进入房间、校验房间密码|
|/squadvox/api/room/close|POST|房主关闭房间|
|/squadvox/api/room/kick|POST|房主踢出房间成员|
|/squadvox/api/trtc/getSig|POST|后端生成TRTC鉴权Sig（核心）|
|/squadvox/api/msg/send|POST|发送房间文字消息|
|/squadvox/api/report/submit|POST|提交用户举报|

## 六、项目开发目录规范（正式统一）

- 前端小程序项目：**squadvox\-miniprogram**

- 后端服务项目：**squadvox\-server**

- 数据库名称：**squadvox\_db**

- 接口统一前缀：**/squadvox/api**

## 七、版本迭代规划（正式固化）

### V1\.0（当前开发版本）

核心语聊房闭环、个人基础资料、合规安全能力，满足基础开黑语音需求，可直接上线验证市场

### V1\.1（后续迭代）

新增英雄战力录入、英雄战区门槛查询工具、成员战力标签展示、房间快捷开黑话术

### V1\.2（后续迭代）

新增用户私信、车队收藏、开黑预约提醒功能

### V1\.3（后续迭代）

新增后台数据看板，统计房间活跃度、用户留存，评估Flutter独立APP开发可行性

## 八、合规风险说明（上线必备）

- 本工具**不抓取、不爬取王者荣耀任何官方数据**，所有游戏信息均为用户手动录入，规避侵权风险

- 所有文字、语音内容均开启官方内容审核，杜绝违规信息，防止小程序下架

- 明确标注与王者荣耀、腾讯官方无关联，完整展示隐私协议

- 适配iOS/安卓系统后台限制，不做虚假功能宣传




# **SquadVox**

定型、释义、品牌定位、项目统一命名全部整理好，直接用于开发、文档、打包、上架。

## 一、名称完整释义

**SquadVox = Squad（游戏小队/车队）\+ Vox（语音/实时声讯）**

- **Squad**：电竞专属词 → 5排车队、开黑小队

- **Vox**：专业音视频词根 → 实时语音、低延迟通话 **直译：小队语音房 / 开黑语音车队**

## 二、品牌调性

- 极简、电竞风、不土、国际化

- 精准匹配「王者开黑组队语聊」核心场景

- 未来可无缝扩展成 **多游戏开黑平台 \+ 独立APP**

## 三、项目统一正式命名（全部固定，开发直接用）

### 项目英文名：**SquadVox**

### 项目中文名：**SquadVox开黑语聊房**

### 开发目录统一命名

- 前端小程序：`squadvox-miniprogram`

- 后端服务：`squadvox-server`

- 数据库名：`squadvox_db`

- 接口前缀统一：`/squadvox/api/xxx`（可选）

## 四、官方Slogan（上架/简介可用）

**SquadVox — 极速开黑语音，随时随地集结车队**

> （注：部分内容由豆包工作 AI 生成）
