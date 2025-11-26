from rich.console import Console
from rich.text import Text

from .log_entry import LogEntry, LogEntrySeverity
from .logger import Logger


class RichLogger(Logger):
    def __init__(self) -> None:
        super().__init__()
        self._console = Console(force_terminal=True, color_system="256", width=200)

    def log(self, entry: LogEntry) -> None:
        payload = self._build_structured_payload(entry)

        timestamp = payload["timestamp"][11:19]
        severity = entry.severity

        colors = {
            LogEntrySeverity.DEBUG: "magenta bold",
            LogEntrySeverity.INFO: "green",
            LogEntrySeverity.WARNING: "yellow",
            LogEntrySeverity.ERROR: "red",
        }
        color = colors.get(severity, "white")

        # Línea principal
        text = Text()
        text.append(f"{timestamp} ", style="dim")
        text.append(f"{severity.value:<7} ", style=color + " bold")
        text.append(payload["message"], style=color)
        self._console.print(text, overflow="ignore")

        # Extras
        indent = "    "  # dos tabulaciones
        for key, value in payload.items():
            if key in ("timestamp", "severity", "message"):
                continue
            extra_text = Text()
            extra_text.append(indent + indent + indent + indent + indent)
            extra_text.append(f"{key}: ", style="cyan")
            extra_text.append(f"{repr(value)}", style="white")
            self._console.print(extra_text, overflow="ignore")
