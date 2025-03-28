# 关于

> !!!项目还在开发中, 并未正式发布

本项目 fork 自 [art-design-pro](https://github.com/Daymychen/art-design-pro) 因原项目是纯前端, 无法做到取之即用, 所以本项目将其改造为一个基础的的前后端分离项目。

本项目只具备基本的用户和菜单权限管理功能。程序员需要在此基础上进行其他业务需求的开发, 当然与原项目相比, 不用适配基础的管理功能, 节省一定的工作量.

相比于原项目，本项目做了如下改动：

1. 对接后端 api
2. 去除多余的展示页面
3. 去除英文切换
4. 去除多余的依赖
5. 用户登录滑动验证码改为图形验证码
6. 去除用户注册
7. 增加水印, 且无法关闭
8. 更符合直觉的菜单管理

# 后端代码

[art-design-pro-edge-go-server](https://github.com/ChnMig/art-design-pro-edge-go-server)

技术栈: `Golang` `Gin` `Gorm` `PostgreSQL` `Redis`

# QA

## 更新频率

在原项目更新时, 本人会尽快同步更新, 但不保证能及时更新。如果是已经精简或者修改过的功能, 不与原项目同步。

## 为什么不做初始化界面

我们假设用户是一个具有开发经验的人，所以我们不会提供一个初始化界面。我们认为用户会通过阅读文档来了解如何使用我们的工具。
