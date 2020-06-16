'use strict';

const builder = require('electron-builder');
const Platform = builder.Platform;
const packagejson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Promise is returned
builder
  .build({
    targets: Platform.MAC.createTarget(),
    config: {
      productName: '行き先掲示板',
      appId: `com.electron.${packagejson.name}`,
      mac: {
        target: {
          target: 'pkg',
        },
      },
    },
  })
  .then(() => {
    // handle result
  })
  .catch((error) => {
    // handle error
  });
