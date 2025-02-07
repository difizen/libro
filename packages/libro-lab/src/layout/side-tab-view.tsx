import { SideTabView, ToolbarRender } from '@difizen/libro-common/mana-app';
import { view } from '@difizen/libro-common/mana-app';
import { transient } from '@difizen/libro-common/mana-app';

@transient()
@view('libro-lab-side-tab')
export class LibroLabSideTabView extends SideTabView {
  override renderTabToolbar(): JSX.Element {
    return <ToolbarRender data={[this]} />;
  }
}
