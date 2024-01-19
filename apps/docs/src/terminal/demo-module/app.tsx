import type { TerminalViewOption } from '@difizen/libro-terminal';
import { TerminalManager, LibroTerminalView } from '@difizen/libro-terminal';
import type { Disposable } from '@difizen/mana-app';
import {
  BaseView,
  ViewInstance,
  ViewManager,
  ViewRender,
  inject,
  singleton,
  useInject,
  view,
} from '@difizen/mana-app';
import { Button, Card, Checkbox, Flex, Form, Input, Space, Tabs } from 'antd';
import type { FC } from 'react';
import { forwardRef, useCallback, useEffect, useState } from 'react';

const gridStyle: React.CSSProperties = {
  width: '50%',
};

const Terminal: FC<{
  // options: TerminalViewOption;
  viewRender: LibroTerminalView;
  updateList: () => void;
}> = function Terminal(props) {
  // const instance = useInject<AppView>(ViewInstance);
  const [pasteVal, setPasteVal] = useState('');
  const [writeLineVal, setWriteLineVal] = useState('');
  const [writeVal, setWriteVal] = useState('');
  const [selection, setSelection] = useState('');
  const [ready, setReady] = useState(false);

  // const [view, setView] = useState<LibroTerminalView | null>(null);
  const view = props.viewRender;

  const [onDidOpenVal, setonDidOpenVal] = useState('');
  const [onDidOpenFailureVal, setonDidOpenFailureVal] = useState('');
  const [onSizeChangedVal, setonSizeChangedVal] = useState('');
  const [onDataVal, setonDataVal] = useState('');
  const [onKeyVal, setonKeyVal] = useState('');

  const [_, forceUpdate] = useState({});

  // message
  useEffect(() => {
    const disposes: Disposable[] = [];
    if (view) {
      disposes.push(
        view.onDidOpen((v) => {
          setonDidOpenVal(JSON.stringify(v));
        }),
      );

      disposes.push(
        view.onDidOpenFailure((v) => {
          setonDidOpenFailureVal(JSON.stringify(v));
        }),
      );
      disposes.push(
        view.onSizeChanged((v) => {
          setonSizeChangedVal(JSON.stringify(v));
        }),
      );
      disposes.push(
        view.onData((v) => {
          setonDataVal(JSON.stringify(v));
        }),
      );
      disposes.push(
        view.onKey((v) => {
          setonKeyVal(JSON.stringify(v));
        }),
      );
      disposes.push(
        view.onReady(() => {
          forceUpdate({});
        }),
      );
      disposes.push(
        view.onTitleChange(() => {
          forceUpdate({});
          props.updateList();
        }),
      );

      disposes.push(
        view.onReady(() => {
          setReady(true);
        }),
      );
    }

    return () => {
      disposes.forEach((d) => {
        d.dispose();
      });
    };
  }, [props, view]);

  if (view === null) {
    return null;
  }

  return (
    <Card
      key={view.id}
      title={'' + view.title.label}
      extra={
        <Button
          type="primary"
          onClick={() => {
            view.dispose();

            //  等待 接口真正删除，本地测试用100ms
            setTimeout(() => {
              props.updateList();
            }, 100);
          }}
        >
          Delete
        </Button>
      }
    >
      <Card.Grid style={gridStyle}>
        <Flex gap={10} vertical={true} style={{ width: '50%' }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input placeholder="getSelection" value={selection} />
            <Button
              type="primary"
              onClick={() => {
                const v = view.getSelection();
                if (v) {
                  setSelection(v);
                }
              }}
            >
              getSelection
            </Button>
          </Space.Compact>

          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="paste value"
              onChange={(e) => {
                setPasteVal(e.target.value);
              }}
            />
            <Button
              type="primary"
              onClick={() => {
                view.paste(pasteVal);
              }}
            >
              paste
            </Button>
          </Space.Compact>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="writeLine value"
              onChange={(e) => {
                setWriteLineVal(e.target.value);
              }}
            />
            <Button
              type="primary"
              onClick={() => {
                view.writeLine(writeLineVal);
              }}
            >
              writeLine
            </Button>
          </Space.Compact>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="write value"
              onChange={(e) => {
                setWriteVal(e.target.value);
              }}
            />
            <Button
              type="primary"
              onClick={() => {
                view.write(writeVal);
              }}
            >
              write
            </Button>
          </Space.Compact>

          <Space wrap>
            <Button
              type="primary"
              onClick={() => {
                view.scrollLineUp();
              }}
            >
              scrollLineUp
            </Button>
            <Button
              type="primary"
              onClick={() => {
                view.scrollLineDown();
              }}
            >
              scrollLineDown
            </Button>
            <Button
              type="primary"
              onClick={() => {
                view.scrollToTop();
              }}
            >
              scrollToTop
            </Button>
            <Button
              type="primary"
              onClick={() => {
                view.scrollToBottom();
              }}
            >
              scrollToBottom
            </Button>
            <Button
              type="primary"
              onClick={() => {
                view.scrollPageUp();
              }}
            >
              scrollPageUp
            </Button>
            <Button
              type="primary"
              onClick={() => {
                view.scrollPageDown();
              }}
            >
              scrollPageDown
            </Button>
            <Button
              type="primary"
              onClick={() => {
                view.resetTerminal();
              }}
            >
              resetTerminal
            </Button>
          </Space>
        </Flex>
      </Card.Grid>
      <Card.Grid style={gridStyle}>
        <Flex gap={10} vertical={true}>
          <Card.Meta title={`terminal ready: ${ready}`} />
          <Card.Meta title={`hasSelection: ${view.hasSelection()}`} />
          <Card.Meta title={`onDidOpenVal: ${onDidOpenVal}`} />
          <Card.Meta title={`onDidOpenFailureVal: ${onDidOpenFailureVal}`} />
          <Card.Meta title={`onSizeChangedVal: ${onSizeChangedVal}`} />
          <Card.Meta title={`onDataVal: ${onDataVal}`} />
          <Card.Meta title={`onKeyVal: ${onKeyVal}`} />
        </Flex>
      </Card.Grid>

      <Card.Grid style={{ width: '100%' }}>
        <div
          style={{
            resize: 'both',
            overflow: 'scroll',
            border: '1px solid black',
            minHeight: '300px',
          }}
        >
          <ViewRender view={view} />
        </div>
      </Card.Grid>
    </Card>
  );
};

export const App = forwardRef(function App() {
  const [views, setViews] = useState<LibroTerminalView[]>([]);

  const [activeKey, setActiveKey] = useState(views[0]?.id);
  //

  const instance = useInject<AppView>(ViewInstance);

  const updateViews = useCallback(
    function updateViews() {
      instance.viewManager
        .getViews<LibroTerminalView>(
          instance.viewManager.toFactoryId(LibroTerminalView),
        )
        .then((v) => {
          setViews(v);
          setActiveKey(v[v.length - 1]?.id);

          return;
        })
        .catch((e) => {
          console.error(e);
        });
    },
    [instance.viewManager],
  );

  useEffect(() => {
    const disposed = instance.terminalManager.runningChanged((models) => {
      // 初始化列表
      if (views.length === 0) {
        Promise.all(
          models.map((m) => {
            return instance.factory(m);
          }),
        )
          .then(() => {
            updateViews();
            return;
          })
          .catch((e) => {
            console.error(e);
          });
      }
    });
    return () => {
      disposed.dispose();
    };
  }, [instance, updateViews, views.length]);

  const items = views.map((v) => {
    return {
      label: (v.title.label as string) || 'loading',
      children: <Terminal key={v.id} viewRender={v} updateList={updateViews} />,
      key: v.id,
    };
  });

  return (
    <div id="libro-lab-content-layout" style={{ padding: '24px' }}>
      <Space direction="vertical">
        <Card title="初始化Terminal选项">
          <Form
            layout="inline"
            onFinish={(values) => {
              instance
                .factory({
                  ...values,
                })
                .then(() => {
                  updateViews();
                  return;
                })
                .catch((e) => {
                  console.error(e);
                });
            }}
            size={'small'}
          >
            <Flex wrap="wrap" gap={'10px'}>
              <Flex wrap="wrap" gap={'20px'}>
                <Form.Item label="name" name="name">
                  <Input placeholder="number or string " />
                </Form.Item>

                <Form.Item label="initialCommand" name="initialCommand">
                  <Input />
                </Form.Item>
                <Form.Item label="cwd" name="cwd">
                  <Input />
                </Form.Item>
                {/* <Form.Item label="shellPath" name="shellPath">
                  <Input />
                </Form.Item>
                <Form.Item label="shellArgs" name="shellArgs">
                  <Input />
                </Form.Item> */}

                <Form.Item name="destroyOnClose" valuePropName="checked">
                  <Checkbox>destroyOnClose</Checkbox>
                </Form.Item>

                <Form.Item name="useServerTitle" valuePropName="checked">
                  <Checkbox>useServerTitle</Checkbox>
                </Form.Item>

                {/* <Form.Item name="isPseudoTerminal" valuePropName="checked">
                  <Checkbox>isPseudoTerminal</Checkbox>
                </Form.Item> */}
              </Flex>

              <Form.Item>
                <Button htmlType="submit" type="primary">
                  创建Terminal
                </Button>
              </Form.Item>
            </Flex>
          </Form>
        </Card>

        <Tabs
          hideAdd
          onChange={(key: string) => {
            setActiveKey(key);
          }}
          activeKey={activeKey}
          type="editable-card"
          onEdit={(targetKey: any, action: 'add' | 'remove') => {
            if (action === 'remove') {
              const targetView = views.find((v) => v.id === targetKey);
              targetView?.dispose();
              updateViews();
            }
          }}
          items={items}
        ></Tabs>
        {/* {views.map((view) => {
          return <Terminal key={view.id} viewRender={view} updateList={updateViews} />;
        })} */}
      </Space>
    </div>
  );
});

@singleton()
@view('libro-lab-layout-main')
export class AppView extends BaseView {
  override view = App;

  @inject(ViewManager) viewManager: ViewManager;

  @inject(TerminalManager) terminalManager: TerminalManager;

  private __uselessid = 0; // 仅仅用于创建，避免参数一样导致缓存

  factory(props: TerminalViewOption) {
    this.__uselessid++;
    return this.viewManager.getOrCreateView<LibroTerminalView>(LibroTerminalView, {
      ...props,
      __uselessid: this.__uselessid,
    });
  }
}
