import { ManaAppPreset, useInject } from '@difizen/mana-app';
import { CommandRegistry, ManaComponents, ManaModule } from '@difizen/mana-app';
import { Button, Checkbox, Divider, Statistic } from 'antd';

import { CommonCommand, MyCommand } from './command.js';
import { Context } from './context-service.js';

const BaseModule = ManaModule.create().register(MyCommand, Context);

const MyCommandRender = () => {
  const command = useInject(CommandRegistry);
  const myCommand = useInject(MyCommand);
  const context = useInject(Context);
  const shiftMode = context.shiftMode.get();
  const ctrlcmdMode = context.ctrlcmdMode.get();
  return (
    <div>
      <div>
        <Statistic title="count" value={myCommand.count} />
      </div>
      <Divider />
      <Checkbox
        checked={context.shiftMode.get()}
        onChange={(e) => {
          context.shiftMode.set(e.target.checked);
        }}
      >
        shift mode
      </Checkbox>
      <Checkbox
        checked={context.ctrlcmdMode.get()}
        onChange={(e) => {
          context.ctrlcmdMode.set(e.target.checked);
        }}
      >
        ctrlcmd mode
      </Checkbox>
      <Divider />
      <div>
        <Button
          shape="round"
          onClick={() => command.executeCommand(CommonCommand.INCREASE_COUNT.id)}
        >
          {shiftMode && 'shift + up | '}
          {ctrlcmdMode && 'ctrlcmd + shift + up | '}
          increase
        </Button>
        <Divider type="vertical" />
        <Button
          shape="round"
          onClick={() => command.executeCommand(CommonCommand.DECREACE_COUNT.id)}
        >
          {shiftMode && 'shift + down | '}
          {ctrlcmdMode && 'ctrlcmd + shift + down | '}
          decreace
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
