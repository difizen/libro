export interface FeatureProps {
  title: string;
  description: string;
  imageUrl: string;
  isImageLeft: boolean;
}

export const totalfeatures: FeatureProps[] = [
  {
    title: '面向投研的量化代码生成场景',
    description:
      'Build stunning landing pages in minutes with our intuitive drag-and-drop interface and pre-designed components.',
    imageUrl:
      '/zhu.png',
    isImageLeft: true,
  },
];

export const firstfeatures: FeatureProps[] = [
  {
    title: '隐私计算场景多节点调试',
    description:
      'SecretNote 是专为隐语开发者打造的高级工具套件，支持多节点代码执行和文件管理，同时提供运行状态追踪功能，能较大程度提升开发者的效率和工作体验。',
    imageUrl:
      '/scretenote.png',
    isImageLeft: true,
  },
  {
    title: '量化场景的智能代码生成',
    description:
      '在量化分析师最舒适习惯的编码环境中，通过 Prompt Cell 丝滑引入大模型生态与定制智能体。',
    imageUrl:
      '/zhu.png',
    isImageLeft: false,
  },
  {
    title: '大数据 SQL 交互增强',
    description: '提供强大的内核定制能力，支持 ODPS SQL 等执行环境',
    imageUrl:
      '/sql_ide.png',
    isImageLeft: true,
  },
];

export const secondfeatures: FeatureProps[] = [
  {
    title: 'AI Copilot',
    description: '支持智能助手 AI 对话功能',
    imageUrl:
      '/copilot.png',
    isImageLeft: true,
  },
  {
    title: 'Notebook 即 App',
    description: '基于 Notebook 结合交互控件生成动态报告',
    imageUrl:
      '/app.png',
    isImageLeft: false,
  },
  {
    title: '版本 Diff 能力',
    description: '支持 Cell 级别的版本 Diff 能力，方便更好的进行版本管理、CR。',
    imageUrl:
      '/diff.png',
    isImageLeft: true,
  },
  {
    title: '更优异的代码提示能力',
    description:
      'Libro 拥有卓越的编辑体验，尤其针对 Python 代码，提供更优异的代码补全、代码提示、代码格式化和定义跳转等功能。',
    imageUrl:
      '/tip.png',
    isImageLeft: false,
  },
];
