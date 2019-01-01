# Get Fit!

https://get-fit.xyz ![Build Status](https://img.shields.io/travis/com/samhinshaw/get_fit.svg?style=flat-square)

Unfortunately, Get Fit is not 100% ready for public use yet, but you can follow the [Public Release Milestone](https://github.com/samhinshaw/get_fit/milestone/1) to keep track of my progress.

## Welcome to Get Fit!

Get Fit is a fitness-tracking app to help with the difficulty of delayed gratification! We all know it's hard to stick to a workout schedule or a diet, but why? Humans are terrible at reasoning when it comes to delayed gratification, we always want everything now!! That's why I built this web app--to help tie long-term fitness goals to near-term rewards! Keep track of your diet and exercise and earn points towards short-term goals! It might take you a while to reach your ultimate goal, but you'll have fun along the way, and hopefully Get Fit will make it just a bit easier to not eat that tempting donut!

## Some rewards that have worked for me

With Partner:

- Do the dishes
- Cook dinner

By yourself:

- Go see a movie
- Try a new craft beer

## Development

### Run

```sh
docker-compose up
```

### Troubleshooting

Containers not rebuilding properly? Remove stopped containers and rebuild!

```
docker-compose rm -fv <container_name>
```

```sh
docker-compose build
```
