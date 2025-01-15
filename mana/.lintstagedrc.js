module.exports = {
  '*': ['prettier --ignore-unknown --check'],
  '*.{css,less}': ['stylelint'],
  '*.{js,jsx,ts,tsx,mjs,mts,cjs,cts,mtsx,ctsx,mjsx,cjsx}': ['eslint'],
};
