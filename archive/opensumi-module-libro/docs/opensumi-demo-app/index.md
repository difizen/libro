## libro

<!-- <code src="./app.tsx" 配置项="值"></code> -->

```jsx
import React from 'react';
import { useEffect } from 'react';
import { startApp } from '../../example/src/browser';

export default () => {
  useEffect(() => {
    startApp();
  }, []);
  return <div id="main" style={{ height: '100vh' }}></div>;
};
```
