export const getPythonCode = (str: string) => {
  const pattern = /```python([\s\S]*?)```/g;
  const matches = str.match(pattern) || [];

  return matches.map((match) => match.replace(/```python([\s\S]*?)```/g, '$1'));
};
