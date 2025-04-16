'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function(hexo) {
  hexo.extend.filter.register('before_generate', function() {
    const publicApiDir = path.join(hexo.public_dir, 'api');
    const publicDataDir = path.join(hexo.public_dir, '_data');
    
    // 确保目录存在
    if (!fs.existsSync(publicApiDir)) {
      fs.mkdirSync(publicApiDir, { recursive: true });
    }
    if (!fs.existsSync(publicDataDir)) {
      fs.mkdirSync(publicDataDir, { recursive: true });
    }
  });
};
