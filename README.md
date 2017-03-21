# Nodelicious

Deliciouse / Shaarli Bookmark Application (NodeJS) Edit

## Applications Needed

You need to have install the following applications:

- Redis (This is to store the user session)
- MongoDB (This will be the main database)

## Installation

You need to run the createMongoCollections to create all the collections with indexs necessary

```
node createMongoCollections.js
```

### Assets

As a second part of the installation, you need to install all the bower dependencies and run Webpack.

```
bower install
```

```
webpack
```

## Webpack

Every page has a specific JS and CSS. You can use the watch command to work on it

````
webpack --watch
````

If you add a page, you need to create the JS and add it to webpack.config.js

## License

Copyright 2017 Ariel Rey. Released under the terms of the MIT license.

## Pull Requests

Im open to all fixes and improvements that you can make. Please send your Pull Request
