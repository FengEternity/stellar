/**
 * https://github.com/tea3/hexo-related-popular-posts/wiki/More-Settings#customize-html
 */

'use strict';

var util = require('hexo-util');

hexo.extend.helper.register('popular_posts_wrapper', function(args){
  const title = args.title;
  const json = args.json.json;
  const cls = args.json.class;
  if (json == undefined || json.length == 0) {
    return '';
  }
  const cfg = hexo.theme.config.article.related_posts;
  if (cfg.enable != true) return;
  var returnHTML = "";
  var div = `
    <div class="related_posts">
    <section class='header'>
      <div class='title cap theme'>${title}</div>
    </section>
    <section class='body'>
    `;
  function generateHTML(list){

    var el = '';
    el += '<a class="item" href="' + list.path + '" title="' + list.title + '" rel="bookmark ">';

    if (cfg.placeholder_img && cfg.placeholder_img.length > 0) {
      el += '<div class="img">'
      if (list.img && list.img != "") {
        el += '<img src="' + list.img + '" />';
      } else {
        el += '<img src="' + cfg.placeholder_img + '" />';
      }
      el += '</div>';
    }

    el += '<span class="title">' + list.title + '</span>';

    if (list.excerpt && list.excerpt.length > 0) {
      el += '<span class="excerpt">' + util.truncate(util.stripHTML(list.excerpt), {length: 120}) + '</span>';
    }

    el +=  '</a>';
    return el;
  }

  for(var i = 0; i < json.length; i++) {
    returnHTML += generateHTML(json[i]);
  }

  if (returnHTML != "") returnHTML = "<div class=\"" + cls + "\">" + returnHTML + "</div>";
  div += returnHTML;
  div += '</section></div>';
  return div;
});