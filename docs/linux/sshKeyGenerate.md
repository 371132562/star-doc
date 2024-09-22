# SSH密钥生成

生成密钥， 一路回车不用输入任何东西，会自动生成在root目录下的.ssh文件夹，此处会有id_rsa和id_rsa.pub两个密钥文件，pub后缀为公钥，另一个为对应的私钥。
```shell
ssh-keygen -t rsa -b 4096 -C ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```
打开密钥文件，复制
```shell
cat ~/.ssh/id_rsa.pub
```
