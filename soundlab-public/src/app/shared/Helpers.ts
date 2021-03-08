/**
 * Get the config path of an instrument config.json path.
 * Ex: /assets/imstrument/drumkit/config.json => /assets/imstrument/drumkit/
 * @param instrumentConfigUrl
 * @private
 */
export function getInstrumentConfigPath(instrumentConfigUrl: string): string {
  const regex = /[^\/]*$/;
  return instrumentConfigUrl.replace(regex, '');
}
