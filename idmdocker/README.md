# IDM and Docker
This is not an easy topic, maybe I'll try to explain how to get eDirectory/IDM up and running in a 3 node docker cluster, no apps, just eDirectory and the IDM Engine. For administration I'll createn an Identity Console container. 

(I'm also new to this).

First have a look at the [Consul Basics](ConsulBasics.md), as without Consul there will be no cluser, and it is too difficult / complicated to get a stable Docker Swarm running. 

In addtion to Consul we will also install [Registrator](https://gliderlabs.github.io/registrator/latest/), just to keep things interesting.

I am following the OpenText (formerly know as NetIQ) documentation from here [Deploying Containers on Distributed Servers](https://www.netiq.com/documentation/identity-manager-48/idm_installing_updating_483/data/t4bk4j6cbno4a.html).


### Prerequisites
- Understanding of how to install NetIQ IDM (**I do not provide support - call them**)
- 3 VM's running docker, mine are named docker1, docker2 and docker3. I would suggest to use something to automate the setup of the VM's (ansible might come in handy).
- basic understanding of Docker
- simple or basic understanding of [Consul](onsulBasics.md)

#### The VM's
I use Debian 12 as base, with docker installed. This will work on any OS which can run docker. I guess even podman will work, but I am a docker person. 


### Docker Cluster Setup

On docker1:
```sh
PUBLIC_IP="$(hostname --all-ip-addresses | awk '{print $1}')"
docker run --name consul --rm  progrium/consul cmd:run $PUBLIC_IP
```

This will output something like this:
```sh
eval docker run --name consul -h $HOSTNAME 	-p 10.10.42.10:8300:8300 	-p 10.10.42.10:8301:8301 	-p 10.10.42.10:8301:8301/udp 	-p 10.10.42.10:8302:8302 	-p 10.10.42.10:8302:8302/udp 	-p 10.10.42.10:8400:8400 	-p 10.10.42.10:8500:8500 	-p 172.17.0.1:53:53 	-p 172.17.0.1:53:53/udp  progrium/consul -server -advertise 10.10.42.10 -bootstrap-expect 3
```

Use this to run:
```sh
docker run --name consul -h $HOSTNAME -d --restart unless-stopped -v /edir/consul/data:/data	-p 10.10.42.10:8300:8300 	-p 10.10.42.10:8301:8301 	-p 10.10.42.10:8301:8301/udp 	-p 10.10.42.10:8302:8302 	-p 10.10.42.10:8302:8302/udp 	-p 10.10.42.10:8400:8400 	-p 10.10.42.10:8500:8500 	-p 172.17.0.1:53:53 	-p 172.17.0.1:53:53/udp  progrium/consul -server -advertise 10.10.42.10 -bootstrap-expect 3
```

Notice that I added '-d --restart unless-stopped -v /edir/consul/data:/data' to make sure that I does what I expect it to do, every time I start docker. Also to make sure that the data it stores will be pesistent.



On docker2 and docker3:
```sh
PUBLIC_IP="$(hostname --all-ip-addresses | awk '{print $1}')"
JOIN_IP=$(host docker1 | cut -d " " -f4)
docker run --name consul --rm  progrium/consul cmd:run $PUBLIC_IP:$JOIN_IP
```

Do the same as above, and run this:
```sh
docker run --name consul -h $HOSTNAME -d --restart unless-stopped -v /edir/consul/data:/data -p 10.10.42.11:8300:8300 	-p 10.10.42.11:8301:8301 	-p 10.10.42.11:8301:8301/udp 	-p 10.10.42.11:8302:8302 	-p 10.10.42.11:8302:8302/udp 	-p 10.10.42.11:8400:8400 	-p 10.10.42.11:8500:8500 	-p 172.17.0.1:53:53 	-p 172.17.0.1:53:53/udp  progrium/consul -server -advertise 10.10.42.11 -join 192.168.1.150
```

and this:
```sh
docker run --name consul -h $HOSTNAME -d --restart unless-stopped -v /edir/consul/data:/data -p 10.10.42.12:8300:8300 	-p 10.10.42.12:8301:8301 	-p 10.10.42.12:8301:8301/udp 	-p 10.10.42.12:8302:8302 	-p 10.10.42.12:8302:8302/udp 	-p 10.10.42.12:8400:8400 	-p 10.10.42.12:8500:8500 	-p 172.17.0.1:53:53 	-p 172.17.0.1:53:53/udp  progrium/consul -server -advertise 10.10.42.12 -join 192.168.1.150
```

**(How I would love if OpenText could and would write useful documenation)**

Now all the small tests from [Consul Basics](ConsulBasics.md) should work.

On each of the docker nodes run:
```sh
echo "
```