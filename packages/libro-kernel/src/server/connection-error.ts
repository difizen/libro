/**
 * A wrapped error for a fetch response.
 */
export class JupyterResponseError extends Error {
  /**
   * The response associated with the error.
   */
  response: Response;

  /**
   * The traceback associated with the error.
   */
  traceback: string;
  /**
   * Create a new response error.
   */
  constructor(
    response: Response,
    message = `The response is invalid: ${response.status} ${response.statusText}`,
    traceback = '',
  ) {
    super(message);
    this.response = response;
    this.traceback = traceback;
  }
}

/**
 * A wrapped error for a network error.
 */
export class NetworkError extends TypeError {
  /**
   * Create a new network error.
   */
  constructor(original: TypeError) {
    super(original.message);
    this.stack = original.stack;
  }
}

/**
 * Create a ResponseError from a response, handling the traceback and message
 * as appropriate.
 *
 * @param response The response object.
 *
 * @returns A promise that resolves with a `JupyterResponseError` object.
 */
export const createResponseError = async (response: Response) => {
  try {
    const data = await response.json();
    if (data.message) {
      return new JupyterResponseError(response, data.message);
    }
    return new JupyterJupyterResponseError(response);
  } catch (e) {
    console.warn(e);
    return new ResponseError(response);
  }
};
