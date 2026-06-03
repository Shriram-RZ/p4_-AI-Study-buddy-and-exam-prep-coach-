"""Tolerant parsing for boolean query params from browsers and axios."""


def parse_bool_query(value: str | bool | None, *, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        v = value.strip().lower()
        if v in ("true", "1", "yes", "on"):
            return True
        if v in ("false", "0", "no", "off", "", "undefined", "null"):
            return False
    return default
