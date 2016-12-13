# dasein
A social network

## Running Locally

You'll need [Docker][docker] to run the project.

* Run the image with `make run`

## Running locally the hard way

If you don't want to use docker, you can also run it the old fashioned
way.

1. Install dependencies with `yarn install` (recommended), or `npm install`
2. Run with `npm start`

## Generating documentation

This project uses JS Doc to generate documentation. Generate everything
with `npm run doc`.

## Building and pushing the image

You can also do some other operations

* Build the image with `make build`
* Push and build the image with `make upload`
* Clean the environment with `make clean`

## Checking the code

This project uses the [Hapi Style Guide][hapi-style-guide] for
javascript style, and includes eslint configuration to check them. Run
`npm run lint` to check the code.

[docker]: https://www.docker.com/
[hapi-style-guide]: https://hapijs.com/styleguide
