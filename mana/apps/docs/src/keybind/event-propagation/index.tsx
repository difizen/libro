import { inject, ManaAppPreset, singleton, useInject } from '@difizen/mana-app';
import { ApplicationContribution } from '@difizen/mana-app';
import { CommandRegistry, ManaComponents, ManaModule } from '@difizen/mana-app';
import { KeybindingRegistry } from '@difizen/mana-app';
import { Button, Divider, Statistic } from 'antd';
import { CommonCommand, MyCommand } from './command';

@singleton({ contrib: ApplicationContribution })
class KeybindEvent implements ApplicationContribution {
  constructor(@inject(KeybindingRegistry) registry: KeybindingRegistry) {
    registry.preventDefault = true;
    registry.stopPropagation = true;
  }
}

const BaseModule = ManaModule.create().register(MyCommand, KeybindEvent);

const MyCommandRender = () => {
  const command = useInject(CommandRegistry);
  const myCommand = useInject(MyCommand);
  return (
    <div>
      <div>
        <Statistic title="count" value={myCommand.count} />
      </div>
      <Divider />
      <div>
        <Button
          shape="round"
          onClick={() => command.executeCommand(CommonCommand.INCREASE_COUNT.id)}
        >
          shift+ctrlcmd+m
        </Button>
        <Divider type="vertical" />
        <Button
          shape="round"
          onClick={() => command.executeCommand(CommonCommand.DECREACE_COUNT.id)}
        >
          shift+ctrlcmd+Minus
        </Button>
        <Divider type="vertical" />
        <Button
          shape="round"
          onClick={() => command.executeCommand(CommonCommand.DOUBLE_COUNT.id)}
        >
          ctrlcmd+s
        </Button>
      </div>
    </div>
  );
};

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      asChild
      modules={[ManaAppPreset, BaseModule]}
      renderChildren
    >
      <MyCommandRender />
    </ManaComponents.Application>
  );
};

export default App;
