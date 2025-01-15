import { useInject } from '@difizen/mana-app';

import { State } from '@/modules/state';

export default function HomePage() {
  const state = useInject(State);
  return (
    <div>
      <h2>Yay! Welcome to mana umi example!</h2>
      <p>
        To get started, edit <code>pages/index.tsx</code> and save to reload.
      </p>
      <button
        onClick={() => {
          state.count += 1;
        }}
      >
        {state.count}
      </button>
    </div>
  );
}
