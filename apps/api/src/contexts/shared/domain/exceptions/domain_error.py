class DomainError(Exception):
    message: str

    def __init__(self, message: str):
        super().__init__(message)
