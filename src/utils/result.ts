export class Result<TSuccess, TError> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _success?: TSuccess,
    private readonly _error?: TError
  ) {}

  static ok<TSuccess, TError>(value: TSuccess): Result<TSuccess, TError> {
    return new Result<TSuccess, TError>(true, value, undefined);
  }

  static fail<TSuccess, TError>(error: TError): Result<TSuccess, TError> {
    return new Result<TSuccess, TError>(false, undefined, error);
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isError(): boolean {
    return !this._isSuccess;
  }

  get value(): TSuccess {
    if (!this._isSuccess) {
      throw new Error('Cannot access success value when result is an error');
    }
    return this._success!;
  }

  get error(): TError {
    if (this._isSuccess) {
      throw new Error('Cannot access error value when result is a success');
    }
    return this._error!;
  }
}