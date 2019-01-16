#!/bin/bash

echo "Travis Tag: $TRAVIS_TAG"
echo "Travis Branch: $TRAVIS_BRANCH"

# If this build was tagged, generate a docker tag with that tag. 
# Otherwise, generate a docker tag from the release branch name.
if [[ -n "$TRAVIS_TAG" ]]; then
  export DOCKER_TAG="$TRAVIS_TAG-$TRAVIS_BUILD_NUMBER"
  echo "Tagging Docker image with: $DOCKER_TAG"
elif [[ $TRAVIS_BRANCH == release* ]]; then
  # Cut any preceding branch at "/"
  CUT_BRANCH=`echo "$TRAVIS_BRANCH" | cut -d "/" -f 2`
  export DOCKER_TAG="$CUT_BRANCH-$TRAVIS_BUILD_NUMBER"
  echo "Tagging Docker image with: $DOCKER_TAG"
else
  echo "Not tagging Docker image."
fi

yarn build:test
