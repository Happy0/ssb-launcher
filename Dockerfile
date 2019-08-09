FROM buildpack-deps:xenial

RUN groupadd -r node
RUN useradd -r -g node node

RUN apt-get install curl libc6 libcurl3 zlib1g libtool autoconf

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
ENV NVM_DIR $HOME/.nvm
RUN . $HOME/.nvm/nvm.sh 
RUN . $HOME/.nvm/nvm.sh && nvm install 8.10.0 && nvm alias default 8.10.0

RUN git clone https://github.com/jedisct1/libsodium.git
RUN cd /libsodium && git checkout
RUN cd /libsodium && ./autogen.sh
RUN cd /libsodium && ./configure && make && make check && make install

RUN mkdir -p /usr/src/ssb
WORKDIR /usr/src/ssb

COPY package.json /usr/src/ssb/
COPY index.js /usr/src/ssb/

RUN . $HOME/.nvm/nvm.sh && npm install

EXPOSE 8009

ENV NPM_CONFIG_LOGLEVEL info

# The /usr/src/ssb/data can be mounted by the host to use its secret file for connecting
# to the ssb server over RPC as a client

# e.g. docker run -v <local path>:/usr/src/ssb/data <image id>

CMD . $HOME/.nvm/nvm.sh && npm run start -- -d "/usr/src/ssb/data" -p 8009




