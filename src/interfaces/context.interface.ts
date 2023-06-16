import { Scenes, Context as TgContext } from 'telegraf';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Context extends Scenes.SceneContext {}

interface WizardSession extends Scenes.WizardSessionData {
  search: null;
}

interface SessionData extends Scenes.WizardSession<WizardSession> {
  activeSearches?: null;
}

export interface TelegrafContext extends TgContext {
  session: SessionData;
  scene: Scenes.SceneContextScene<TelegrafContext, WizardSession>;
  wizard: Scenes.WizardContextWizard<TelegrafContext>;
}
