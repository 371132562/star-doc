# Docker
## 基础命令
### 查看、停止和删除容器以及镜像
```shell
# 查看所有容器（-a表示所有all，包含正在运行的，包括由docker compose启动的容器）
dokcer ps -a
# 等价于
docker container ls -a


# 停止容器（container_id在不重复的情况下可以只提供前三位）
docker stop <container_id> 
# 例如
docker stop 1234567890ab


# 删除容器
docker rm <container_id>
# 删除所有已停止的容器
docker container prune
# 删除所有容器（无论是否运行）
docker rm $(docker ps -a)


# 查看所有镜像（包括由docker compose创建的镜像）
docker images


# 删除镜像
docker rmi <image_id>
# 删除所有未被使用的镜像
docker image prune
# 删除所有镜像（无论是否运行）
docker rmi $(docker images -a)


# 查看所有数据卷
docker volume ls
# 删除数据卷（需要先停止使用该数据卷的容器）
docker volume rm <volume_name>
# 删除所有未被使用的数据卷
docker volume prune
```

### Docker Compose（Compose Plugin）
```shell
# 需要在当前目录下创建docker-compose.yml文件
docker compose up -d 
# -d表示后台运行，运行后，终端会返回一个短暂的容器 ID，而不会显示容器的输出。


# 停止所有由docker compose启动的容器
docker compose stop


# 删除所有由docker compose启动的容器
# 它不会删除数据卷和镜像，除非你指定了相应的选项。
docker compose down
# 删除所有由docker compose启动的容器、数据卷（--volumes）和镜像（--rmi all）
docker compose down --volumes --rmi all
```
