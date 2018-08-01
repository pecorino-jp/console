# Pecorino Console

[![CircleCI](https://circleci.com/gh/pecorino-jp/console.svg?style=svg)](https://circleci.com/gh/pecorino-jp/console)

## Table of contents

* [Usage](#usage)
* [License](#license)

## Usage

### Environment variables

| Name                                   | Required | Purpose            | Value            |
|----------------------------------------|----------|--------------------|------------------|
| `DEBUG`                                | false    | pecorino-console:* | Debug            |
| `NODE_ENV`                             | true     |                    | environment name |
| `PECORINO_API_ENDPOINT`                | true     |                    | APIエンドポイント       |
| `PECORINO_API_AUTHORIZE_SERVER_DOMAIN` | true     |                    | API認可サーバードメイン    |
| `PECORINO_API_CLIENT_ID`               | true     |                    | APIクライアントID      |
| `PECORINO_API_CLIENT_SECRET`           | true     |                    | APIクライアントシークレット  |
| `PECORINO_API_CODE_VERIFIER`           | true     |                    | APIコード検証鍵        |
| `REDIS_HOST`                           | true     |                    | ログイン状態保持ストレージ    |
| `REDIS_PORT`                           | true     |                    | ログイン状態保持ストレージ    |
| `REDIS_KEY`                            | true     |                    | ログイン状態保持ストレージ    |
| `USER_EXPIRES_IN_SECONDS`              | true     |                    | ユーザーセッション保持期間    |
| `BASIC_AUTH_NAME`                      | false    |                    | ベーシック認証          |
| `BASIC_AUTH_PASS`                      | false    |                    | ベーシック認証          |

## License

ISC
