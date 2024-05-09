export interface WidgetState {
  behavior?: string;
  continuous_update: boolean;
  description: string;
  description_allow_html: boolean;
  disabled: boolean;
  layout?: string;
  readout: boolean;
  readout_format: string;
  style?: string;
  [key: string]: any;
}

export const defaultWidgetState: WidgetState = {
  continuous_update: false,
  description_allow_html: false,
  description: '',
  disabled: false,
  readout: true,
  readout_format: 'd',
};

export interface OrientableState {
  orientation: 'horizontal' | 'vertical';
}
