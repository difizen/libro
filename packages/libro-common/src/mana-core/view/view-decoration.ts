/**
 * Namespace for the decoration data and the styling refinements for the decorated widgets.
 */
export namespace ViewDecoration {
  /**
   * For the sake of simplicity, we have merged the `font-style`, `font-weight`, and the `text-decoration` together.
   */
  export type FontStyle =
    | 'normal'
    | 'bold'
    | 'italic'
    | 'oblique'
    | 'underline'
    | 'line-through';
  /**
   * A string that could be:
   *
   *  - one of the browser colors, (E.g.: `blue`, `red`, `magenta`),
   *  - the case insensitive hexadecimal color code, (for instance, `#ee82ee`, `#20B2AA`, `#f09` ), or
   *  - either the `rgb()` or the `rgba()` functions.
   *
   * For more details, see: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value.
   *
   * Note, it is highly recommended to use one of the predefined colors of Mana, so the desired color will
   * look nice with both the `light` and the `dark` theme too.
   */
  export type Color = string;
  /**
   * Encapsulates styling information of the font.
   */
  export type FontData = {
    /**
     * Zero to any font style.
     */
    readonly style?: FontStyle | FontStyle[];
    /**
     * The color of the font.
     */
    readonly color?: Color;
  };
  /**
   * Arbitrary information that has to be shown either before or after the caption as a prefix or a suffix.
   */
  export type CaptionAffix = {
    /**
     * The text content of the prefix or the suffix.
     */
    readonly data: string;
    /**
     * Font data for customizing the prefix of the suffix.
     */
    readonly fontData?: FontData;
  };
  export type BaseTailDecoration = {
    /**
     * Optional tooltip for the tail decoration.
     */
    readonly tooltip?: string;
  };
  /**
   * Unlike caption suffixes, tail decorations appears right-aligned after the caption and the caption suffixes (is any).
   */
  export type TailDecoration = {
    /**
     * The text content of the tail decoration.
     */
    readonly data: string;
    /**
     * Font data for customizing the content.
     */
    readonly fontData?: FontData;
  } & BaseTailDecoration;
  export type TailDecorationIcon = {
    /**
     * This should be the name of the Font Awesome icon with out the `fa fa-` prefix, just the name, for instance `paw`.
     * For the existing icons, see here: https://fontawesome.com/v4.7.0/icons/.
     */
    readonly icon: string;
    /**
     * The color of the icon.
     */
    readonly color?: Color;
  } & BaseTailDecoration;
  export type TailDecorationIconClass = {
    /**
     * This should be the entire Font Awesome class array, for instance ['fa', 'fa-paw']
     * For the existing icons, see here: https://fontawesome.com/v4.7.0/icons/.
     */
    readonly iconClass: string[];
    /**
     * The color of the icon.
     */
    readonly color?: Color;
  } & BaseTailDecoration;
  /**
   * Enumeration for the quadrant to overlay the image on.
   */

  /**
   * A shape that can be optionally rendered behind the overlay icon. Can be used to further refine colors.
   */
  export type IconOverlayBackground = {
    /**
     * Either `circle` or `square`.
     */
    readonly shape: 'circle' | 'square';
    /**
     * The color of the background shape.
     */
    readonly color?: Color;
  };

  /**
   * Encapsulates styling information that has to be applied on the widget which we decorate.
   */
  export type Data = {
    /**
     * The higher number has higher priority. If not specified, treated as `0`.
     * When multiple decorators are available for the same item, and decoration data cannot be merged together,
     * then the higher priority item will be applied on the decorated element and the lower priority will be ignored.
     */
    readonly priority?: number;
    /**
     * The font data for the caption.
     */
    readonly fontData?: FontData;
    /**
     * The background color of the entire row.
     */
    readonly backgroundColor?: Color;
    /**
     * Optional, leading prefixes right before the caption.
     */
    readonly captionPrefixes?: CaptionAffix[];
    /**
     * Suffixes that might come after the caption as an additional information.
     */
    readonly captionSuffixes?: CaptionAffix[];
    /**
     * Optional right-aligned decorations that appear after the widget caption and after the caption suffixes (is any).
     */
    readonly tailDecorations?: (
      | TailDecoration
      | TailDecorationIcon
      | TailDecorationIconClass
    )[];
    /**
     * Custom tooltip for the decorated item. Tooltip will be appended to the original tooltip, if any.
     */
    readonly tooltip?: string;
    /**
     * Sets the color of the icon. Ignored if the decorated item has no icon.
     */
    readonly iconColor?: Color;
    /**
     * A count badge for widgets.
     */
    readonly badge?: number;
  };
}
