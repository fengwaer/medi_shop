:: 先创建登录名，再用兼容旧版本的语法添加管理员权限
sqlcmd -E -S 127.0.0.1 -Q "CREATE LOGIN [medi_shop] WITH PASSWORD=N'shop...123', CHECK_POLICY=OFF, CHECK_EXPIRATION=OFF; EXEC sp_addsrvrolemember 'medi_shop', 'sysadmin';"