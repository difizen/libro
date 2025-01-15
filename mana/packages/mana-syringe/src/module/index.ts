import { SyringeModule } from './syringe-module';

export * from './syringe-module';

export function Module(name?: string): SyringeModule {
  return new SyringeModule(name);
}
