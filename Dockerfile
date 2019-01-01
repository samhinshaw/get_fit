# Create image based on the official Node 8 image from dockerhub. This image is
# the default node 8 image, which inherits from debian:jessie-slim, the same as
# the mongo images. Relevant issue in node docker repo:
# https://github.com/nodejs/docker-node/issues/618
FROM node:8.12-jessie

#######################
##    SETUP PYTHON   ##
#######################

# Install Python & Python packages

ENV GPG_KEY 0D96DF4D4110E5C43FBFB17F2D347EA6AA65421D
ENV PYTHON_VERSION 3.6.7

RUN set -ex \
  \
  && savedAptMark="$(apt-mark showmanual)" \
  && apt-get update && apt-get install -y --no-install-recommends \
  dpkg-dev \
  gcc \
  libbz2-dev \
  libc6-dev \
  libexpat1-dev \
  libffi-dev \
  libgdbm-dev \
  liblzma-dev \
  libncursesw5-dev \
  libreadline-dev \
  libsqlite3-dev \
  libssl-dev \
  make \
  tk-dev \
  wget \
  xz-utils \
  zlib1g-dev \
  # as of Stretch, "gpg" is no longer included by default
  $(command -v gpg > /dev/null || echo 'gnupg dirmngr') \
  \
  && wget -O python.tar.xz "https://www.python.org/ftp/python/${PYTHON_VERSION%%[a-z]*}/Python-$PYTHON_VERSION.tar.xz" \
  && wget -O python.tar.xz.asc "https://www.python.org/ftp/python/${PYTHON_VERSION%%[a-z]*}/Python-$PYTHON_VERSION.tar.xz.asc" \
  && export GNUPGHOME="$(mktemp -d)" \
  && gpg --batch --keyserver ha.pool.sks-keyservers.net --recv-keys "$GPG_KEY" \
  && gpg --batch --verify python.tar.xz.asc python.tar.xz \
  && { command -v gpgconf > /dev/null && gpgconf --kill all || :; } \
  && rm -rf "$GNUPGHOME" python.tar.xz.asc \
  && mkdir -p /usr/src/python \
  && tar -xJC /usr/src/python --strip-components=1 -f python.tar.xz \
  && rm python.tar.xz \
  \
  && cd /usr/src/python \
  && gnuArch="$(dpkg-architecture --query DEB_BUILD_GNU_TYPE)" \
  && ./configure \
  --build="$gnuArch" \
  --enable-loadable-sqlite-extensions \
  --enable-shared \
  --with-system-expat \
  --with-system-ffi \
  --without-ensurepip \
  && make -j "$(nproc)" \
  && make install \
  && ldconfig \
  \
  && apt-mark auto '.*' > /dev/null \
  && apt-mark manual $savedAptMark \
  && find /usr/local -type f -executable -not \( -name '*tkinter*' \) -exec ldd '{}' ';' \
  | awk '/=>/ { print $(NF-1) }' \
  | sort -u \
  | xargs -r dpkg-query --search \
  | cut -d: -f1 \
  | sort -u \
  | xargs -r apt-mark manual \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/* \
  \
  && find /usr/local -depth \
  \( \
  \( -type d -a \( -name test -o -name tests \) \) \
  -o \
  \( -type f -a \( -name '*.pyc' -o -name '*.pyo' \) \) \
  \) -exec rm -rf '{}' + \
  && rm -rf /usr/src/python \
  \
  && python3 --version

# make some useful symlinks that are expected to exist
RUN cd /usr/local/bin \
  && ln -s idle3 idle \
  && ln -s pydoc3 pydoc \
  && ln -s python3 python \
  && ln -s python3-config python-config

# if this is called "PIP_VERSION", pip explodes with "ValueError: invalid truth value '<VERSION>'"
ENV PYTHON_PIP_VERSION 18.1

RUN set -ex; \
  \
  savedAptMark="$(apt-mark showmanual)"; \
  apt-get update; \
  apt-get install -y --no-install-recommends wget; \
  \
  wget -O get-pip.py 'https://bootstrap.pypa.io/get-pip.py'; \
  \
  apt-mark auto '.*' > /dev/null; \
  [ -z "$savedAptMark" ] || apt-mark manual $savedAptMark; \
  apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
  rm -rf /var/lib/apt/lists/*; \
  \
  python get-pip.py \
  --disable-pip-version-check \
  --no-cache-dir \
  "pip==$PYTHON_PIP_VERSION" \
  ; \
  pip --version; \
  \
  find /usr/local -depth \
  \( \
  \( -type d -a \( -name test -o -name tests \) \) \
  -o \
  \( -type f -a \( -name '*.pyc' -o -name '*.pyo' \) \) \
  \) -exec rm -rf '{}' +; \
  rm -f get-pip.py

# Install Locked Python Packages

RUN pip install arrow==0.10.0 \
  bson==0.5.7                 \     
  myfitnesspal==1.11.0        \
  pymongo==3.7.2              \
  python-dateutil==2.6.1      \
  python-dotenv==0.1.0

#################
##   BACKEND   ##
#################

# Create a directory where our app will be placed
# (-p creates the intermediate directories /usr/src if they don’t already exist)
RUN mkdir -p /app

# Change directory so that our commands run inside this new directory
WORKDIR /app

# For some reason nodemon & snyk need to be install globally
RUN yarn global add nodemon
# RUN yarn global add snyk

# Copy dependency definitions
COPY ./package.json /app
COPY ./yarn.lock /app

# Install dependecies
RUN yarn install

#################
##     COPY    ##
#################

# Get all the backend code needed to run the app
COPY ./ /app

#################
##    BUILD    ##
#################

# package front-end code
RUN yarn build:ui

# transpile back-end code
RUN yarn build:server

#################
##    START    ##
#################

# Default command is to spin up server in production mode
CMD ["yarn", "prod"]