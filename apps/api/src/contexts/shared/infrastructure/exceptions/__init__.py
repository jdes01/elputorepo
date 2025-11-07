class InfrastructureError(Exception):
    """Base exception for infrastructure layer errors."""

    def __init__(self, message: str, original_error: Exception | None = None):
        self.message = message
        self.original_error = original_error
        super().__init__(self.message)


class DatabaseError(InfrastructureError):
    """Raised when a database operation fails."""

    pass


class RepositoryError(InfrastructureError):
    """Raised when a repository operation fails."""

    pass
