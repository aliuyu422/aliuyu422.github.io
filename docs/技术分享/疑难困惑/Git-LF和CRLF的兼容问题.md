# LF和CRLF的兼容问题

我们可以进行如下全局配置，配置完成重新拉取代码就可以解决：
git config --global core.autocrlf false

true: 提交时转换为 LF，拉取时转换为 CRLF
false: 提交拉取均不转换
input: 提交时转换为LF，拉取时不转换
