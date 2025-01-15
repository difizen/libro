import { prop, singleton } from '@difizen/mana-app';

@singleton()
export class State {
  // const [counter, setCounter] = useState(0);
  // const [darkTheme, setDarkTheme] = useState(true);

  @prop()
  counter = 0;

  @prop()
  darkTheme: boolean;
}
