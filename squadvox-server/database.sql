-- SquadVox V1.0 数据库初始化脚本
CREATE DATABASE IF NOT EXISTS squadvox_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE squadvox_db;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户主键ID',
  `wx_openid` VARCHAR(64) NOT NULL COMMENT '微信唯一标识',
  `nickname` VARCHAR(64) DEFAULT '' COMMENT '微信昵称',
  `avatar` VARCHAR(512) DEFAULT '' COMMENT '头像地址（内置主题路径或上传后的 URL）',
  `game_area` VARCHAR(16) DEFAULT '' COMMENT '游戏大区：微信区/QQ区',
  `game_server` VARCHAR(32) DEFAULT '' COMMENT '游戏服务器',
  `game_id` VARCHAR(32) DEFAULT '' COMMENT '王者荣耀游戏ID',
  `rank` VARCHAR(32) DEFAULT '' COMMENT '游戏段位',
  `position` VARCHAR(32) DEFAULT '' COMMENT '擅长分路',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='SquadVox用户表';

-- 房间表
CREATE TABLE IF NOT EXISTS `room` (
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
CREATE TABLE IF NOT EXISTS `room_message` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '消息主键ID',
  `room_no` VARCHAR(32) NOT NULL COMMENT '关联房间编号',
  `user_id` INT NOT NULL COMMENT '发送用户ID',
  `content` VARCHAR(512) DEFAULT '' COMMENT '消息内容',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房间文字消息表';

-- 举报记录表
CREATE TABLE IF NOT EXISTS `report` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '举报主键ID',
  `room_no` VARCHAR(32) DEFAULT '' COMMENT '关联房间编号',
  `target_user_id` INT DEFAULT 0 COMMENT '被举报用户ID',
  `report_type` VARCHAR(32) DEFAULT '' COMMENT '举报类型：辱骂/广告/不良言论',
  `desc` VARCHAR(512) DEFAULT '' COMMENT '举报备注描述',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '举报时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户举报记录表';
