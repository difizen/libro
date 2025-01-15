import { ManaAppPreset, useInject } from '@difizen/mana-app';
import { CommandRegistry, ManaComponents, ManaModule } from '@difizen/mana-app';
import { Button, Divider, Statistic } from 'antd';
import { CommonCommand, MyCommand } from './command';

const BaseModule = ManaModule.create().register(MyCommand);

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
          shift + up
        </Button>
        <Divider type="vertical" />
        <Button
          shape="round"
          onClick={() => command.executeCommand(CommonCommand.DECREACE_COUNT.id)}
        >
          shift + down
        </Button>
        <Divider type="vertical" />
        <Button
          shape="round"
          onClick={() => command.executeCommand(CommonCommand.DOUBLE_COUNT.id)}
        >
          d d
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
