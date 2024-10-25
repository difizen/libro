import { prop, singleton } from '@difizen/mana-app';

@singleton()
export class LibroAINativeService {
  @prop()
  showSideToolbar = false;
}
