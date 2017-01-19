# dasein
A social network

## Configuring

This project usese environment variables to work. For most cases, the
defaults work but some sensitive info like keys must be overridden. Copy
the file in `config/env.dist` to `.env` in the project root and override
the values.

When running with `make run`, it'll pick up these values automatically.
If you're doing it the hard way, you'll have to source them.

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

## Setting up Twitter for login

1. Create an app on https://apps.twitter.com/
2. Make sure you check "Allow this application to be used to Sign in with Twitter"
3. Make sure you specify a callback URL (eg. http://localhost:1927/login-callback)

## Checking the code

This project uses the [Hapi Style Guide][hapi-style-guide] for
javascript style, and includes eslint configuration to check them. Run
`npm run lint` to check the code.

[docker]: https://www.docker.com/
[hapi-style-guide]: https://hapijs.com/styleguide
