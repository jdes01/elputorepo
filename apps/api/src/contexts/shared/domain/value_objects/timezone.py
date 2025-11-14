from dataclasses import dataclass
from zoneinfo import ZoneInfo, available_timezones


@dataclass(frozen=True)
class Timezone:
    value: str

    def __post_init__(self) -> None:
        if self.value not in available_timezones():
            raise ValueError(f"Invalid timezone: '{self.value}'")

    @property
    def zoneinfo(self) -> ZoneInfo:
        return ZoneInfo(self.value)

    def __str__(self) -> str:
        return self.value

    @classmethod
    def from_utc_offset(cls, hours: int) -> "Timezone":
        if not -12 <= hours <= 14:
            raise ValueError("UTC offset fuera de rango (-12 a +14)")
        sign = "+" if hours >= 0 else "-"
        return cls(f"Etc/GMT{sign}{abs(hours)}")
