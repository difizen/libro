import { SideTabView, ToolbarRender } from '@difizen/mana-app';
import { view } from '@difizen/mana-app';
import { transient } from '@difizen/mana-app';

@transient()
@view('libro-lab-side-tab')
export class LibroLabSideTabView extends SideTabView {
  override renderTabToolbar(): JSX.Element {
    return <ToolbarRender data={[this]} />;
  }
}
