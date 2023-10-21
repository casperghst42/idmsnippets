# Docker Consul (the easy way)

Unfortunately the documentation for Consule is not for humans to understand, the git repo is now in legacy (https://github.com/gliderlabs/docker-consul/tree/legacy), and it is still not great, and it is old.

There is a very good youtube introduction which shows how to get it to work: [Getting Started with Consul in Docker with DigitalOcean cloud](https://www.youtube.com/watch?v=tsdtBLeXMYY)


### Quick steps

#### On Node 1
```sh
PUBLIC_IP="$(hostname --all-ip-addresses | awk '{print $1}')"
$(docker run --name consul --rm progrium/consul cmd:run $PUBLIC_IP -it)
```

#### On Node 2 and 3
```sh
PUBLIC_IP="$(hostname --all-ip-addresses | awk '{print $1}')"
JOIN_IP="node1 - PUBLIC_IP"
$(docker run --name consul --rm progrium/consul cmd:run $PUBLIC_IP::$JOIN_IP -it)
```


### WebUI

Per default the Consul UI is running

**http://PUBLIC_IP:8500/ui**

![Consul-UI](consul-ui.png)


### Run some tests

#### Keyvalue store

**Node 1**

Put a value in the key value store
```sh
curl $PUBLIC_IP:8500/v1/kv/hello -X PUT -d "Hello world"
```

**Node 2**

Get the value from the key value store
```
curl $PUBLIC_IP:8500/v1/kv/hello | jq '.[0].Value' | tr -d '"' | base64 -d
```

**Look at it using the UI**

![Consul-UI-Keystore](consul-ui-keystore.png)


#### DNS 
Consule comes with an build in DNS server.

It will registre the host (not the container) automatically.

Lookup localhost
```sh
dig @172.17.0.1 $(hostname).node.consul
```

Lookup the 2nd node
```sh
dig @172.17.0.1 node1.node.consul
```

Lookup the consul service
```sh
dig @172.17.0.1 consul.service.consul
```

Result
```sh
...
;; ANSWER SECTION:
consul.service.consul.	0	IN	A	10.10.42.10
consul.service.consul.	0	IN	A	10.10.42.11
consul.service.consul.	0	IN	A	10.10.42.12
```

#### Deamon DNS

It is possible to configure it's own DNS server, if you do not already have an /etc/daemon.json then create one and add '"dns":[ "172.17.0.1", "&lt;your default dns>" ]'

Then restart docker (just to be sure), and make sure to start consul:
```sh
systemctl restart docker
docker start consul
```
You can verify that the resolver will be configured correctly:
```sh
docker run -it --rm debian:latest cat etc/resolv.conf
```
output:
```sh
Unable to find image 'debian:latest' locally
latest: Pulling from library/debian
0a9573503463: Pull complete
Digest: sha256:7d3e8810c96a6a278c218eb8e7f01efaec9d65f50c54aae37421dc3cbeba6535
Status: Downloaded newer image for debian:latest
search c-note.dk
nameserver 172.17.0.1
nameserver <my dns server>
```


Then you can verify that a container will be able to lookup the consul services:
```sh
docker run --rm aanand/docker-dnsutils dig consul.service.consul
```
output:
```
;; ANSWER SECTION:
consul.service.consul.	0	IN	A	10.10.42.10
consul.service.consul.	0	IN	A	10.10.42.11
consul.service.consul.	0	IN	A	10.10.42.12
```


