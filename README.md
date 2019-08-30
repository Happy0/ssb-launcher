# ssb-launcher

A command line program for launching an instance of `ssb-server` with the [scuttlebutt-akka-persistence-index](http://github.com/openlawteam/scuttlebutt-akka-persistence-index) plugin.

# Configuration

The application is configured using the following environment variables.

| Environment Variable  | Description |
| ------------- | ------------- |
| PORT  | The port the ssb-server should listen on  |
| GENERATE_INVITE  | If 'true', an invite code will be generated and printed to STDOUT when the server starts. Useful for connecting two instances together for testing. Can be redeemed when starting another instance by using the 'INVITE' environment variable.  |
| DATA             | The directory on the filesystem which should be used to store the data. If it doesn't already exist, it will be created. If it already exists, the files won't be overwritten. |
| INVITE           | Optionally process the invite code value (https://github.com/ssbc/ssb-server/wiki/pub-servers#what-is-an-invite-code) to connect to another ssb server and have the nodes follow each other.    |
| SSB_SECRET_KEYPAIR | Optionally use the supplied base64 representation of a scuttlebutt key JSON object ( https://github.com/ssbc/ssb-keys#keys )    |
| SSB_KEYPATH  | Optionally load the scuttlebutt key file at the given filesystem path          |
| EXTERNAL_HOST | The external host to use when generating an invite code. Defaults to 127.0.0.1  |


# Command line example

The following command would launch the server and bind it to port 8010. The ssb data storage directory would be set to `/home/user1/instance` (which would be created if it has not already been created.)

```
npm install
node index.js
```

# Docker

A Docker image can be built using the `Dockerfile` using `docker build .`

The image can then be run as a Docker container. A directory from the host system can be mounted to the container's configured `ssb` directory in order to use an existing ssb data directory by configuring the container's ssb directory with the `DATA` environment variable, and then using that as the mount point.


```
export NPM_CONFIG_LOGLEVEL=info
export DATA=/usr/src/ssb/data
export PORT=8009

docker run <image id> -d -v <local_directory>:/usr/src/ssb/data
```
