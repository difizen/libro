import { prop, singleton } from '@difizen/mana-app';

@singleton()
export class State {
  @prop()
  count = 0;
}
