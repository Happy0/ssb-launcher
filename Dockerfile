# Use current NodeJS LTS version (10.x), slim variant.
#
# Typically we would use node:10-alpine for the smallest possible image, but
# some of the JS deps here want to take advantage of sodium-native, which
# currently does not bundle a "pre-build" version for MUSL Linux. Thus we use
# slim instead for now, and trade a bit of extra image size for not needing to
# do as much compilation at build time.
#
# In the future, it may be desirable to just do this compilation so we can use
# alpine linux if we want a smaller image, or even to help contribute to the
# upstream project to have a MUSL prebuild.[1]
# 
# [1]: https://github.com/sodium-friends/sodium-native/issues/33
FROM node:10-slim

# Install node_modules.
#
# Additional explanations:
#
#  - By copying the package*.json files and then doing the installation of node
#    modules as a step prior to copying the JS source code, it uses layer
#    ordering such that typical changes to the JS source do not require
#    reinstalling/rebuilding the node_modules, as those cache layers remain
#    valid.
#
#  - NPM "ci" is best used when installing from a package-lock.json. It's
#    significantly faster, and relies upon the lock file versions as the source
#    of truth, instead of trying to potentially upgrade deps.
COPY package*.json ./
RUN apt-get update && apt-get install -y git \
    && npm ci \
    && apt-get remove --purge -y git \
    && rm -rf /var/lib/apt/lists/*
# NOTE: The only reason the installation git is needed above is because of the
# dependency on a GitHub repo in package.json for an unpublished package
# (scuttlebutt-akka-persistence-index). We remove it right after install (in the
# same command) to avoid bloating the layer filesize. However, once this is
# switched to a published npm package, the entire command can just be replaced
# with "RUN npm ci", which will be much faster.

# Add the source for the server
COPY index.js .

# Conf values as env vars so they can be easily overriden at run time.
#
# The /usr/src/ssb/data can be mounted by the host to use its secret file for
# connecting to the ssb server over RPC as a client.
# e.g. docker run -v <local path>:/usr/src/ssb/data -p 8009:8009 <image id>
ENV NPM_CONFIG_LOGLEVEL=info
ENV DATA=/usr/src/ssb/data
ENV PORT=8009
ENV SSB_SECRET_KEYPAIR=
ENTRYPOINT ["npm", "run", "start", "--"]
CMD ["-d", "$DATA", "-p", "$PORT", "--key", "$SSB_SECRET_KEYPAIR"]
