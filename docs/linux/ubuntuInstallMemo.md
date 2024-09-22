# 安装Ubuntu备忘录

## 虚拟机网络配置
在VMware-虚拟机-设置-网络适配器中选择桥接模式，这样虚拟机的网络配置最为简单，会自动获取网段中的一个IP，无需额外手动配置。

虽然会占用一个局域网IP，但是可以和本机及局域网内的其他设备直接通信。

## 允许以root用户登录
安装完成后，系统默认不允许root用户登录，只能通过安装过程中创建的用户登录，需要修改配置文件。

1. `sudo passwd root` 设置root密码
2. `sudo vim /etc/ssh/sshd_config` 修改配置文件
    ```
    #PermitRootLogin prohibit-password // [!code --]
    PermitRootLogin yes // [!code ++]
    ```
3. 重启服务器或重启sshd服务后以root登录

## 时区
```shell
# 查询当前时区设置
timedatectl
# 查看所有可用的时区列表
timedatectl list-timezones
# 设置时区
timedatectl set-timezone Asia/Shanghai
```

## LVM逻辑卷未占满磁盘
通过`lsblk`命令查看磁盘分区情况，一般`ubuntu`会安装在`sda3`分区，其中`ubuntu-lv`卷的大小有可能并未占满分区大小。
通过下边的命令将`ubuntu-lv`卷组扩容到磁盘的最大容量。
```shell
sudo lvextend -l +100%FREE /dev/mapper/ubuntu--vg-ubuntu--lv
```
或者扩充指定的大小。
```shell
sudo lvextend -L 50G /dev/mapper/ubuntu--vg-ubuntu--lv
```

## 安装zsh及美化

1. 安装zsh `apt install zsh`
2. 安装[oh-my-zsh](https://github.com/ohmyzsh/ohmyzsh) 
```shell
sh -c "$(curl -fsSL https://install.ohmyz.sh/)"

```
3. 安装主题[powerlevel10k](https://github.com/romkatv/powerlevel10k?tab=readme-ov-file#oh-my-zsh) 
```shell
git clone --depth=1 https://gitee.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

```
安装完成后重连ssh会自动启动主题配置，根据提示配置为个人喜欢的风格即可。

## 安装zsh插件
[zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting/blob/master/INSTALL.md)

[zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions/blob/master/INSTALL.md#oh-my-zsh)

## 安装docker
1. 安装依赖
```shell
apt update
apt install apt-transport-https ca-certificates curl gnupg lsb-release
```
2. 添加DockerGPG密钥 这里使用阿里云镜像
```shell
$ curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```
3. 设置stable仓库
```shell
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] http://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
4. 安装docker
```shell
apt update
apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin       
```

## 安装NodeJS
[NodeSource](https://github.com/nodesource/distributions)提供了不同版本的NodeJS在apt当中的镜像地址，通过添加镜像源来安装NodeJS。
