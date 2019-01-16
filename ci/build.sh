#!/bin/bash

# If this build was tagged, generate a docker tag with that tag. 
# Otherwise, generate a docker tag from the release branch name.
if [[ -n "$TRAVIS_TAG" ]]; then
  DOCKER_TAG="$TRAVIS_TAG-$TRAVIS_BUILD_NUMBER"
else if [[ $TRAVIS_BRANCH == release* ]]; then
  # Cut any preceding branch at "/"
  CUT_BRANCH=`echo "$TRAVIS_BRANCH" | cut -d "/" -f 2`
  DOCKER_TAG="$CUT_BRANCH-$TRAVIS_BUILD_NUMBER"
fi

yarn build:test