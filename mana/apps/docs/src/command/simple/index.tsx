import { ManaAppPreset, useInject } from '@difizen/mana-app';
import { CommandRegistry, ManaComponents, ManaModule } from '@difizen/mana-app';
import { Button, Divider } from 'antd';

import { CommonCommand, MyCommand } from './command.js';

const BaseModule = ManaModule.create().register(MyCommand);

const MyCommandRender = () => {
  const command = useInject(CommandRegistry);
  const myCommand = useInject(MyCommand);
  return (
    <div>
      {command.isVisible(CommonCommand.INCREASE_COUNT.id, myCommand) && (
        <Button
          disabled={!command.isEnabled(CommonCommand.INCREASE_COUNT.id, myCommand)}
          icon={<CommonCommand.INCREASE_COUNT.icon />}
          onClick={() =>
            command.executeCommand(CommonCommand.INCREASE_COUNT.id, myCommand)
          }
        >
          {CommonCommand.INCREASE_COUNT.label}: {myCommand.count}
        </Button>
      )}
      <Divider />
      {command.isVisible(CommonCommand.DECREACE_COUNT.id, myCommand) && (
        <Button
          disabled={!command.isEnabled(CommonCommand.DECREACE_COUNT.id)}
          icon={<CommonCommand.DECREACE_COUNT.icon />}
          onClick={() => command.executeCommand(CommonCommand.DECREACE_COUNT.id)}
        >
          {CommonCommand.DECREACE_COUNT.label}: {myCommand.count}
        </Button>
      )}
    </div>
  );
};

const App = (): JSX.Element => {
  return (
    <ManaComponents.Application
      asChild={true}
      modules={[ManaAppPreset, BaseModule]}
      renderChildren
    >
      <MyCommandRender />
    </ManaComponents.Application>
  );
};

export default App;
