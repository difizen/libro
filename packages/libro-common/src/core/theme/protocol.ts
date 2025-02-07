export type CssVariable = {
  name: string;
  value: string;
};

export interface VariableDefinition<T = any> {
  prefix?: string;
  id: string;
  defaults?:
    | {
        light: T;
        dark: T;
        [key: string]: T;
      }
    | undefined;
  description: string;
}

export const DefaultVariablePrefix = 'mana';
