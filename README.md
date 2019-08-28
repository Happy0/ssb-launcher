# ssb-launcher

A command line program for launching an instance of `ssb-server` with the [scuttlebutt-akka-persistence-index](http://github.com/openlawteam/scuttlebutt-akka-persistence-index) plugin.

# Command line example

The following command would launch the server and bind it to port 8010. The ssb data storage directory would be set to `/home/user1/instance` (which would be created if it has not already been created.)

```
npm install
node index.js --port 8010 --dir /home/user1/instance
```

# Docker

A docker image can be built using the `Dockerfile` using `docker build .`

The image can then be ran as a docker container. A directory from the host system can be mounted to the container's configured `ssb` directory in order to use an existing ssb data directory by configuring the container's ssb directory with the `DATA` environment variable, and then using that as the mount point.


```
export NPM_CONFIG_LOGLEVEL=info
export DATA=/usr/src/ssb/data
export PORT=8009

docker run <image id> -d -v <local_directory>:/usr/src/ssb/data
```