<img src="https://motionpicture.jp/images/common/logo_01.svg" alt="motionpicture" title="motionpicture" align="right" height="56" width="98"/>

# Pecorino Console

[![CircleCI](https://circleci.com/gh/motionpicture/pecorino-console.svg?style=svg&circle-token=0c65818a49ef1322b853fbc7541c929a2800d0e9)](https://circleci.com/gh/motionpicture/pecorino-console)

## Table of contents

* [Usage](#usage)
* [Code Samples](#code-samples)
* [Jsdoc](#jsdoc)
* [License](#license)
* [Reference](#reference)

## Usage

### Environment variables

| Name                                   | Required | Purpose            | Value                       |
| -------------------------------------- | -------- | ------------------ | --------------------------- |
| `DEBUG`                                | false    | pecorino-console:* | Debug                       |
| `NPM_TOKEN`                            | true     |                    | NPM auth token              |
| `NODE_ENV`                             | true     |                    | environment name            |
| `PECORINO_API_ENDPOINT`                | true     |                    | APIエンドポイント           |
| `PECORINO_API_AUTHORIZE_SERVER_DOMAIN` | true     |                    | API認可サーバードメイン     |
| `PECORINO_API_CLIENT_ID`               | true     |                    | APIクライアントID           |
| `PECORINO_API_CLIENT_SECRET`           | true     |                    | APIクライアントシークレット |
| `PECORINO_API_CODE_VERIFIER`           | true     |                    | APIコード検証鍵             |
| `REDIS_HOST`                           | true     |                    | ログイン状態保持ストレージ  |
| `REDIS_PORT`                           | true     |                    | ログイン状態保持ストレージ  |
| `REDIS_KEY`                            | true     |                    | ログイン状態保持ストレージ  |
| `USER_EXPIRES_IN_SECONDS`              | true     |                    | ユーザーセッション保持期間  |
| `BASIC_AUTH_NAME`                      | false    |                    | ベーシック認証              |
| `BASIC_AUTH_PASS`                      | false    |                    | ベーシック認証              |

## Jsdoc

`npm run doc` emits jsdoc to ./doc.

## License

UNLICENSED
