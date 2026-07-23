
## 命令
ls:列出某文件夹下的文件，添加参数可实现更细致的功能，
ls -a 列出所有文件，包括隐藏文件
ls -l 列出文件及其详细信息
cd切换目录,cd到不存在的目录时会报错
pwd打印当前目录
cat:读取某一个文件内的内容
wc:获取某一个文件的行数和字数
cp:复制某文件
mkdir:创建目录
rmdir：删除目录
rm-rf:r删除内部所有文件，f参数表示强制，rm -r junk删除junk目录及其下面的所有文件；
mv移动 mv photos.jpg Photos 将photos移动到文件夹Photos下
sort排序
diff:比较两个文件的异同

显示tcp的端口和进程等相关情况：netstat -tnlp
验证是否安装：rpm -p 文件名
查询java环境变量:java -version
查看文件的方法：cat 文件名
mv 原名 修改名 修改文件名
rpm -qa |grep java 看是否安装了java
echo $PATH 看环境变量是否配置了java路径
find / -name java 查找java文件

## 处理

vi编辑器有三种模式：
命令模式，编辑模式，末行模式
打开vi后首先是命令模式，用i,o,a等进入编辑模式，按esc退出编辑模式，回到命令模式。
在命令模式下输入:wq表示保存退出，:wq!强制保存退出，:w表示保存，:w file表示保存在另一个文件中 :q表示退出
在命令模式下可以用用ZZ，ZQ这些指令直接保存退出。

tar
-c: 建立压缩档案
-x：解压
-t：查看内容
-r：向压缩归档文件末尾追加文件
-u：更新原压缩包中的文件
解压
tar -xvf file.tar //解压 tar包
tar -xzvf file.tar.gz //解压tar.gz
tar -xjvf file.tar.bz2 //解压 tar.bz2
tar -xZvf file.tar.Z //解压tar.Z
unrar e file.rar //解压rar
unzip file.zip //解压zip

例如：
解压jdk到指定文件夹：
tar -xzvf jdk-8u131-linux-x64.tar.gz -C /usr/local/java

## 快捷键

Tap:点击Tab键可以实现命令补全,目录补全、命令参数补全;
Ctrl+c:强行终止当前程序（常用）;
Ctrl+d:键盘输入结束或退出终端（常用）;
Ctrl+s:暂停当前程序，暂停后按下任意键恢复运行;
Ctrl+z:将当前程序放到后台运行，恢复到前台为命令fg;
Ctrl+a:将光标移至输入行头，相当于Home键;
Ctrl+e:将光标移至输入行末，相当于End键;
Ctrl+k:删除从光标所在位置到行末,常配合ctrl+a使用;
Alt+Backspace:向前删除一个单词，常配合ctrl+e使用;
Shift+PgUp:将终端显示向上滚动;
Shift+PgDn:将终端显示向下滚动;
上下方向键:浏览历史输入记录;

## 系统相关

date:获取当前时间
uname:返回系统名称
hostname：返回系统的主机名称
--version/-V查看某个程序的版本
history显示历史
echo：返回你给的值,可以简单理解为js中的console或python中的print
man使用一个叫做less的程序，查看某个命令的帮助文档
less:linenumer u d keyarray search(大小写敏感)，正则表达式
crontab -l -u XXX  查看XXX用户的定时任务