## l3.io Source Code

This work is based on [JSON Resume](https://jsonresume.org). I have to patch different npm packages to make it looks nice for me namely:
 - [resume-cli](https://github.com/laithshadeed/resume-cli)
 - [jsonresume-theme-stackoverflow](https://github.com/laithshadeed/jsonresume-theme-stackoverflow)
 - [jsonresume-theme-markdown](https://github.com/laithshadeed/jsonresume-theme-markdown)
 - [jsonresume-theme-businesscard-minimal](https://github.com/laithshadeed/jsonresume-theme-businesscard-minimal)

Copyrights & thanks is preserved for each module author.

## Build

```
# Install yarn: https://yarnpkg.com/en/docs/install
yarn

```

## Serve locally

```
gulp serve

```

## Serve locally from dist direcotry

```
gulp serve:dist

```

## Publish to s3 bucket

```
gulp publish

```

## License
The code is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
