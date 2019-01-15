#!/bin/bash

if [[ $TRAVIS_BRANCH == release* || -n "$TRAVIS_TAG" ]]; then
  echo "Beginning deploy..."
else 
  echo "Not a release branch or tagged commit. Exiting..."
  exit 0
fi

# Log in to DockerHub
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# If this build was tagged, generate a docker tag with that tag. 
# Otherwise, generate a docker tag from the release branch name.
if [[ -n "$TRAVIS_TAG" ]]; then
  DOCKER_TAG="$TRAVIS_TAG-$TRAVIS_BUILD_NUMBER"
else
  # Cut any preceding branch at "/"
  CUT_BRANCH=`echo "$TRAVIS_BRANCH" | cut -d "/" -f 2`
  DOCKER_TAG="$CUT_BRANCH-$TRAVIS_BUILD_NUMBER"
fi

# Then, let the user know what image we're pushing
echo "Pushing Image $DOCKER_TAG"
 
# Debug statement to list images
docker images

# Push our node image to my DockerHub
docker push samhinshaw/get_fit:$DOCKER_TAG