class OperationResult[T]:
    def __init__(self, success: bool, data: T | None = None, error: str | None = None):
        self.success = success
        self.data = data
        self.error = error

    def __repr__(self) -> str:
        return f"<OperationResult success={self.success} data={self.data} error={self.error}>"
