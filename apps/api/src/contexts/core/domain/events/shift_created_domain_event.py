from dataclasses import dataclass

from src.contexts.shared.domain.domain_event import DomainEvent
from ..value_objects import ShiftId, EmployeeId, CompanyId


@dataclass
class ShiftCreated(DomainEvent):
    shift_id: ShiftId
    employee_id: EmployeeId
    company_id: CompanyId
