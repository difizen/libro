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
import { Button, Card, Checkbox, Flex, Form, Input, Space } from 'antd';
import { forwardRef, useCallback, useEffect, useState } from 'react';

import { TerminalManager } from './manager.js';
import type { TerminalViewOption } from './protocol.js';
import { LibroTerminalView } from './view.js';

const gridStyle: React.CSSProperties = {
  width: '50%',
};

const Terminal = function Terminal(props: {
  // options: TerminalViewOption;
  viewRender: LibroTerminalView;
  updateList: () => void;
}) {
  // const instance = useInject<AppView>(ViewInstance);
  const [pasteVal, setPasteVal] = useState('');
  const [writeLineVal, setWriteLineVal] = useState('');
  const [writeVal, setWriteVal] = useState('');
  const [selection, setSelection] = useState('');

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
    if (view) {
      view.onDidOpen((v) => {
        setonDidOpenVal(JSON.stringify(v));
      });
      view.onDidOpenFailure((v) => {
        setonDidOpenFailureVal(JSON.stringify(v));
      });
      view.onSizeChanged((v) => {
        setonSizeChangedVal(JSON.stringify(v));
      });
      view.onData((v) => {
        setonDataVal(JSON.stringify(v));
      });
      view.onKey((v) => {
        setonKeyVal(JSON.stringify(v));
      });
      view.onReady(() => {
        forceUpdate({});
      });
      view.onTitleChange(() => {
        forceUpdate({});
      });
    }
  }, [view]);

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
  const instance = useInject<AppView>(ViewInstance);

  // const [terminalViews, setTerminalViews] = useState<Record<string, LibroTerminalView>>(
  //   {},
  // );

  // const updateList = useCallback(() => {
  //   instance.terminalManager.requestRunning();
  // }, [instance.terminalManager]);

  // useEffect(() => {
  //   const disposed = instance.terminalManager.runningChanged((models) => {
  //     // delete
  //     function diffAndDeleteRender() {
  //       function diffValuesInA1(a1: string[], a2: string[]): string[] {
  //         // 存储差异值的数组
  //         const diffArr: string[] = [];

  //         // 遍历 a2 数组中的每个值
  //         for (const value of a2) {
  //           // 如果该值在 a1 中不存在，则将其加入差异值数组
  //           if (!a1.includes(value)) {
  //             diffArr.push(value);
  //           }
  //         }

  //         return diffArr;
  //       }
  //       const diff = diffValuesInA1(
  //         models.map((v) => v.name),
  //         Object.keys(terminalViews),
  //       );
  //       console.log('delete ids', diff);
  //       diff.forEach((v) => {
  //         delete terminalViews[v];
  //       });
  //     }
  //     diffAndDeleteRender();

  //     if (Object.keys(terminalViews).length === 0) {
  //       const initRenderLise = (models: TerminalModel[]) => {
  //         Promise.all(
  //           models
  //             .filter((v) => {
  //               return !terminalViews[v.name];
  //             })
  //             .map(async (m) => {
  //               const view = await instance.factory(m);
  //               return { [m.name]: view };
  //             }),
  //         )
  //           .then((views) => {
  //             setTerminalViews((s) => {
  //               return {
  //                 ...s,
  //                 ...views.reduce((acc, v) => {
  //                   return {
  //                     ...acc,
  //                     ...v,
  //                   };
  //                 }, {}),
  //               };
  //             });
  //             return;
  //           })
  //           .catch((e) => {
  //             console.error(e);
  //           });
  //       };
  //       initRenderLise(models);
  //     }
  //   });
  //   return () => {
  //     disposed.dispose();
  //   };
  // }, [instance, instance.terminalManager, terminalViews]);

  const [views, setViews] = useState<LibroTerminalView[]>([]);

  const updateViews = useCallback(
    function updateViews() {
      instance.viewManager
        .getViews<LibroTerminalView>(
          instance.viewManager.toFactoryId(LibroTerminalView),
        )
        .then((v) => {
          setViews(v);
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

        {views.map((view) => {
          return <Terminal key={view.id} viewRender={view} updateList={updateViews} />;
        })}
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
