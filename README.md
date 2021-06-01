# Pecorino Console

[![CircleCI](https://circleci.com/gh/pecorino-jp/console.svg?style=svg)](https://circleci.com/gh/pecorino-jp/console)

## Table of contents

* [Usage](#usage)
* [License](#license)

## Usage

### Environment variables

| Name                          | Required | Purpose            | Value                                 |
| ----------------------------- | -------- | ------------------ | ------------------------------------- |
| `DEBUG`                       | false    | pecorino-console:* | Debug                                 |
| `API_AUTHORIZE_SERVER_DOMAIN` | true     |                    | API credentials                       |
| `API_CLIENT_ID`               | true     |                    | API credentials                       |
| `API_CLIENT_SECRET`           | true     |                    | API credentials                       |
| `API_CODE_VERIFIER`           | true     |                    | API credentials                       |
| `BASIC_AUTH_NAME`             | false    |                    | Basic auth settings                   |
| `BASIC_AUTH_PASS`             | false    |                    | Basic auth settings                   |
| `CHEVRE_API_ENDPOINT`         | true     |                    | Chevre API Endpoint                   |
| `REDIS_HOST`                  | true     |                    | Redis connection settings for session |
| `REDIS_PORT`                  | true     |                    | Redis connection settings for session |
| `REDIS_KEY`                   | true     |                    | Redis connection settings for session |
| `USER_EXPIRES_IN_SECONDS`     | true     |                    | Login user session expiration         |

## License

ISC
