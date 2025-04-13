utils.jq(() => {
  $(function () {
    const heatmaps = document.getElementsByClassName('ds-heatmap');
    for (var i = 0; i < heatmaps.length; i++) {
      const el = heatmaps[i];
      const api = el.getAttribute('api');
      if (api == null) {
        continue;
      }

      // 创建热力图容器
      const chartDom = document.createElement('div');
      chartDom.style.cssText = 'height:110px;margin:1rem 0;padding:0.5rem;background:transparent;';
      el.appendChild(chartDom);
      
      // 初始化 ECharts
      const myChart = echarts.init(chartDom, null, { renderer: 'canvas' });
      window.addEventListener('resize', () => myChart.resize());

      // 获取数据并渲染热力图
      utils.request(el, api, function(posts) {
        const dataMap = new Map();
        
        posts.forEach(function(post) {
          const date = new Date(post.date);
          const key = date.getFullYear() + '-' + 
                    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(date.getDate()).padStart(2, '0');
          const value = dataMap.get(key);
          
          if (value == null) {
            dataMap.set(key, [{
              link: post.url,
              title: post.title
            }]);
          } else {
            value.push({
              link: post.url,
              title: post.title
            });
          }
        });

        const data = [];
        for (const [key, value] of dataMap.entries()) {
          data.push([key, value.length]);
        }

        // 设置时间范围（过去一年到现在）
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        const endDate = new Date();

        const formatDate = date => echarts.format.formatTime('yyyy-MM-dd', date);
        
        // 获取主题颜色
        const style = getComputedStyle(document.documentElement);
        const themes = {
          light: {
            backgroundColor: 'rgba(246, 248, 250, 0.95)',
            blockColor: '#f6f8fa',
            highlightColor: ['#f6f8fa', '#aff5b4', '#7ee787', '#4ac26b', '#2da44e'],
            textColor: style.getPropertyValue('--text-p2').trim() || '#999'
          },
          dark: {
            backgroundColor: 'rgba(22, 27, 34, 0.95)',
            blockColor: '#161b22',
            highlightColor: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
            textColor: style.getPropertyValue('--text-p2').trim() || '#666'
          }
        };

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const currentTheme = isDark ? themes.dark : themes.light;

        const option = {
          backgroundColor: 'transparent',
          tooltip: {
            hideDelay: 1000,
            enterable: true,
            backgroundColor: currentTheme.backgroundColor,
            borderWidth: 0,
            padding: [10, 10],
            textStyle: {
              color: currentTheme.textColor,
              fontSize: 12
            },
            formatter: function (p) {
              const date = p.data[0];
              const posts = dataMap.get(date);
              let content = `<span style="font-size: 0.75rem;font-family: var(--font-family-code);">${date}</span>`;
              for (const post of posts) {
                content += "<br>";          
                content += `<a href="${post.link}" style="color: var(--theme-highlight);">${post.title}</a>`;
              }
              return content;
            }
          },
          visualMap: {
            show: false,
            min: 0,
            max: Math.max(...data.map(item => item[1]), 4),
            inRange: {   
              color: currentTheme.highlightColor
            }
          },
          calendar: {
            left: 20,
            right: 5,
            top: 20,
            bottom: 0,
            cellSize: [8, 8],
            gap: 6,
            range: [formatDate(startDate), formatDate(endDate)],
            itemStyle: {
              color: currentTheme.blockColor,
              borderWidth: 0,
              borderRadius: 2
            },
            splitLine: {
              show: false
            },
            monthLabel: {
              nameMap: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
              textStyle: {
                color: currentTheme.textColor,
                fontSize: 12,
                fontWeight: 400
              },
              align: 'left',
              margin: 8
            },
            dayLabel: {
              firstDay: 1,
              nameMap: ['日', '一', '', '三', '', '五', ''],
              textStyle: {
                color: currentTheme.textColor,
                fontSize: 12
              },
              margin: 5
            }
          },
          series: {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            data: data,
            itemStyle: {
              borderWidth: 0,
              borderRadius: 2
            }
          }
        };
        
        myChart.setOption(option);
        
        myChart.on('click', function(params) {
          if (params.componentType === 'series') {
            const post = dataMap.get(params.data[0])[0];
            window.open(post.link, '_blank').focus();
          }
        });

        // 监听主题变化
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
              const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
              const theme = isDark ? themes.dark : themes.light;
              
              option.tooltip.backgroundColor = theme.backgroundColor;
              option.tooltip.textStyle.color = theme.textColor;
              option.visualMap.inRange.color = theme.highlightColor;
              option.calendar.itemStyle.color = theme.blockColor;
              option.calendar.monthLabel.textStyle.color = theme.textColor;
              option.calendar.dayLabel.textStyle.color = theme.textColor;
              option.series.itemStyle.borderColor = theme.backgroundColor;
              
              myChart.setOption(option);
            }
          });
        });

        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme']
        });
      });
    }
  });
}); 