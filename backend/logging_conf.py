import logging


def configure_logging() -> None:
    """Basic structured-ish logging for local dev and containers."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

    # Reduce noise from SQLAlchemy engine unless needed
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
