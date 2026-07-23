export default [
  { text: '首页', link: '/' },
  { text: '文章管理', link: '/admin/', target: '_blank' },
  { 
    text: '技术分享', 
    items: [
      { text: '技术总结', 
        link: '/技术分享/技术总结/特殊节日界面灰白色样式处理' 
      },
      { text: '疑难困惑', 
        link: '/技术分享/疑难困惑/Git-LF和CRLF的兼容问题' 
      },
    ],
    // 选择后实现高亮
    activeMatch: '/技术分享/'
  },
  { 
    text: '生活分享',
    items: [
      { text: '日常随笔', 
        link: '/生活分享/日常随笔/2020年5月的一些小事' 
      },
      { text: '旅行日记', 
        link: '/生活分享/旅行日记/出差青岛' 
      },
      { text: '育儿分享', 
        link: '/生活分享/育儿分享/index' 
      },
    ],
    activeMatch: '/生活分享/'
  },
  { 
    text: '观读感受', 
    items: [
      { text: '观海听涛', 
        link: '/观读感受/观海听涛/鱿鱼游戏' 
      },
      { text: '书读万卷', 
        link: '/观读感受/书读万卷/index' 
      },
    ],
    // 选择后实现高亮
    activeMatch: '/观读感受/'
  },
]
