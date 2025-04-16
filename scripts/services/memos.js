'use strict';

const fs = require('fs');
const path = require('path');

hexo.extend.generator.register('memos', function(locals) {
  const log = this.log || console;
  
  log.info('Memos generator started');
  
  const memosDir = path.join(this.source_dir, '_posts/_memos');
  log.info('Looking for memos in:', memosDir);
  
  try {
    if (fs.existsSync(memosDir)) {
      const files = fs.readdirSync(memosDir)
        .filter(file => file.endsWith('.md'));
      
      log.info(`Found ${files.length} memo files`);
      
      const memos = [];
      
      files.forEach(file => {
        try {
          const filePath = path.join(memosDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.trim().split('\n');
          
          let currentMemo = null;
          
          lines.forEach(line => {
            line = line.trim();
            
            if (line.match(/^- \d{2}:\d{2}$/)) {
              if (currentMemo) {
                memos.push(currentMemo);
              }
              currentMemo = {
                time: line.substring(2),
                date: file.replace('.md', ''),
                tags: [],
                content: []
              };
              log.debug(`Processing memo: ${file} - ${line}`);
            } else if (line.startsWith('#')) {
              currentMemo && currentMemo.tags.push(line.substring(1).trim());
            } else if (line && currentMemo) {
              currentMemo.content.push(line);
            }
          });
          
          if (currentMemo) {
            memos.push(currentMemo);
          }
        } catch (err) {
          log.error(`Error processing memo file ${file}:`, err);
        }
      });
      
      memos.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB - dateA;
      });
      
      log.info(`Successfully generated ${memos.length} memos`);
      
      // 生成 API 文件
      return {
        path: 'api/memos.json',
        data: JSON.stringify(memos, null, 2)
      };
    } else {
      log.warn('Memos directory not found:', memosDir);
    }
  } catch (err) {
    log.error('Error in memos generator:', err);
  }
  
  // 如果出错或目录不存在，返回空数组
  return {
    path: 'api/memos.json',
    data: '[]'
  };
});
