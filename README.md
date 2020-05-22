# Jupiter

## Description

* `GET /` or `GET /new`: Default page for saving file.
* `GET /view`: Show all the text files previously submitted.
    * Clicking the file name will trigger browser to download the file.
    * Edit a previously submitted text file with `Edit` button by its side.
* Lock implemented using Redis.

## Launch

```
npm install 
npm run local
```
**Note**: Please make sure the redis server is started.

## Environment

Project is created with:
* Node.js `12.16.3`
* npm  `v6.14.4`

Browser is tested with:
* Google Chrome Version `83.0.4103.61`

## Runnable Cloud Platform

[Heroku page](https://jupitersdk.herokuapp.com/)
