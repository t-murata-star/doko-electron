'use strict';

const builder = require('electron-builder');
const Platform = builder.Platform;

// Promise is returned
builder
  .build({
    targets: Platform.MAC.createTarget(),
    config: {
      productName: '行き先掲示板',
      appId: `com.electron.s`,
      mac: {
        target: {
          target: 'pkg',
        },
        icon: './public/logo512.png',
      },
    },
  })
  .then(() => {
    // handle result
  })
  .catch((error) => {
    // handle error
  });
