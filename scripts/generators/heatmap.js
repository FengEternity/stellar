hexo.extend.generator.register('heatmap', function (locals) {
  const posts = locals.posts.sort('-date').map(post => ({
    title: post.title,
    date: post.date,
    url: post.permalink
  }));

  return {
    path: 'api/posts.json',
    data: JSON.stringify(posts)
  };
}); 