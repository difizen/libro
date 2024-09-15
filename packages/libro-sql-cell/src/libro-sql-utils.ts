import type { LibroSqlCellView } from './libro-sql-cell-view.js';

export const getDfVariableName = (cells: LibroSqlCellView[]) => {
  let maxNumber = 0; // 记录目前找到的最大数字

  // 遍历数组中的每个变量名
  for (const cell of cells) {
    // 检查变量名是否符合 "df_" 开头，并且后面跟着数字的格式
    if (cell.model.resultVariable?.startsWith('df_')) {
      const numberPart = cell.model.resultVariable.slice(3); // 提取 "df_" 后面的部分
      const num = parseInt(numberPart, 10); // 将提取出来的部分转成数字

      // 确保提取出来的是有效数字，并更新最大数字
      if (!isNaN(num)) {
        maxNumber = Math.max(maxNumber, num);
      }
    }
  }

  // 返回下一个可用的变量名
  return `df_${maxNumber + 1}`;
};
